import os
import signal
import subprocess
import threading
from pathlib import Path
from typing import Dict, Any

from bson import ObjectId
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient

# -----------------------------
# Configuration
# -----------------------------
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
FFMPEG_PATH = os.environ.get("FFMPEG_PATH", "ffmpeg")
HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", "5000"))

client = MongoClient(MONGO_URI)
db = client.get_database("overlay_db")
overlays_col = db.get_collection("overlays")

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent
HLS_ROOT = BASE_DIR / "hls"
HLS_ROOT.mkdir(parents=True, exist_ok=True)

# Track FFmpeg processes by stream_key
processes: Dict[str, subprocess.Popen] = {}
lock = threading.Lock()

# -----------------------------
# Utility functions
# -----------------------------
def _ensure_stream_dir(stream_key: str) -> Path:
    d = HLS_ROOT / stream_key
    d.mkdir(parents=True, exist_ok=True)
    # Clean old files
    for f in d.glob("*"):
        try:
            f.unlink()
        except Exception:
            pass
    return d

def start_ffmpeg(rtsp_url: str, stream_key: str):
    stream_dir = _ensure_stream_dir(stream_key)
    playlist = stream_dir / "index.m3u8"

    cmd = [
        FFMPEG_PATH,
        "-rtsp_transport", "tcp",
        "-i", rtsp_url,
        "-fflags", "nobuffer",
        "-flags", "low_delay",
        "-an",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-tune", "zerolatency",
        "-g", "25",
        "-sc_threshold", "0",
        "-f", "hls",
        "-hls_time", "2",
        "-hls_list_size", "5",
        "-hls_flags", "delete_segments+program_date_time",
        "-hls_segment_filename", str(stream_dir / "seg_%04d.ts"),
        str(playlist),
    ]
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return proc

# -----------------------------
# New routes for health & root
# -----------------------------
@app.route("/")
def home():
    return jsonify({
        "message": "🎥 Live Video Overlays Backend is Running",
        "status": "OK",
        "docs": ["/api/overlays", "/api/stream/start", "/api/stream/stop", "/health"]
    })

@app.route("/health")
def health():
    return jsonify({"status": "healthy"}), 200

# -----------------------------
# Stream Control Endpoints
# -----------------------------
@app.route("/api/stream/start", methods=["POST"])
def api_stream_start():
    data = request.get_json(force=True)
    rtsp_url = data.get("rtsp_url")
    stream_key = data.get("stream_key", "default")
    if not rtsp_url:
        return jsonify({"error": "rtsp_url required"}), 400
    with lock:
        if stream_key in processes and processes[stream_key].poll() is None:
            return jsonify({"status": "already_running", "stream_key": stream_key}), 200
        proc = start_ffmpeg(rtsp_url, stream_key)
        processes[stream_key] = proc
    return jsonify({"status": "started", "stream_key": stream_key}), 200

@app.route("/api/stream/stop", methods=["POST"])
def api_stream_stop():
    data = request.get_json(force=True)
    stream_key = data.get("stream_key", "default")
    with lock:
        proc = processes.get(stream_key)
        if not proc:
            return jsonify({"status": "not_running"}), 200
        try:
            proc.send_signal(signal.SIGTERM)
        except Exception:
            pass
        processes.pop(stream_key, None)
    return jsonify({"status": "stopped"}), 200

# -----------------------------
# Serve HLS files
# -----------------------------
@app.route("/hls/<path:subpath>")
def serve_hls(subpath: str):
    parts = Path(subpath)
    stream_key = parts.parts[0]
    file_rel = Path(*parts.parts[1:])
    directory = HLS_ROOT / stream_key
    if not directory.exists():
        return jsonify({"error": "stream not found"}), 404
    return send_from_directory(directory, file_rel.name if file_rel.name else "index.m3u8", as_attachment=False)

# -----------------------------
# Overlay CRUD Endpoints
# -----------------------------
def serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    doc["_id"] = str(doc["_id"])
    return doc

@app.route("/api/overlays", methods=["GET"])
def list_overlays():
    stream_key = request.args.get("stream_key")
    q = {"stream_key": stream_key} if stream_key else {}
    items = list(overlays_col.find(q).sort([("_id", 1)]))
    return jsonify([serialize(x) for x in items])

@app.route("/api/overlays", methods=["POST"])
def create_overlay():
    data = request.get_json(force=True)
    if "stream_key" not in data:
        return jsonify({"error": "stream_key required"}), 400
    overlay = {
        "stream_key": data["stream_key"],
        "type": data.get("type", "text"),
        "x": int(data.get("x", 0)),
        "y": int(data.get("y", 0)),
        "width": data.get("width"),
        "height": data.get("height"),
        "opacity": float(data.get("opacity", 1)),
        "text": data.get("text"),
        "color": data.get("color"),
        "bgColor": data.get("bgColor"),
        "fontSize": data.get("fontSize"),
        "url": data.get("url"),
        "alt": data.get("alt"),
    }
    res = overlays_col.insert_one(overlay)
    overlay["_id"] = str(res.inserted_id)
    return jsonify(overlay), 201

@app.route("/api/overlays/<id>", methods=["PUT"])
def update_overlay(id: str):
    data = request.get_json(force=True)
    fields = {k: v for k, v in data.items() if k in {
        "stream_key","type","x","y","width","height","opacity","text","color","bgColor","fontSize","url","alt"
    }}
    if not fields:
        return jsonify({"error": "no fields to update"}), 400
    overlays_col.update_one({"_id": ObjectId(id)}, {"$set": fields})
    doc = overlays_col.find_one({"_id": ObjectId(id)})
    if not doc:
        return jsonify({"error": "not found"}), 404
    return jsonify(serialize(doc))

@app.route("/api/overlays/<id>", methods=["DELETE"])
def delete_overlay(id: str):
    overlays_col.delete_one({"_id": ObjectId(id)})
    return jsonify({"status": "deleted"})

# -----------------------------
# Main
# -----------------------------
if __name__ == "__main__":
    HLS_ROOT.mkdir(parents=True, exist_ok=True)
    app.run(host=HOST, port=PORT, debug=True)

