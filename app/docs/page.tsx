export default function DocsPage() {
  return (
    <main className="min-h-dvh p-6 md:p-10">
      <div className="mx-auto max-w-4xl prose prose-invert">
        <h1>RTSP Overlay App — Setup & API</h1>

        <h2>Overview</h2>
        <p>
          This app plays a live video stream converted from RTSP to HLS and lets you manage text/logo overlays. The
          frontend is React (Next.js). The backend is Flask with MongoDB and FFmpeg for RTSP→HLS.
        </p>

        <h2>Environment Variables</h2>
        <ul>
          <li>
            <strong>NEXT_PUBLIC_API_BASE</strong>: Flask API base URL, e.g. http://localhost:5000
          </li>
          <li>
            <strong>NEXT_PUBLIC_HLS_BASE</strong>: HLS base URL, e.g. http://localhost:5000/hls
          </li>
          <li>
            <strong>MONGO_URI</strong> (backend): MongoDB connection string
          </li>
          <li>
            <strong>FFMPEG_PATH</strong> (optional backend): Path to ffmpeg binary
          </li>
        </ul>

        <h2>Running the Backend (Flask)</h2>
        <ol>
          <li>Install FFmpeg on your system.</li>
          <li>Install Python deps from scripts/backend/requirements.txt.</li>
          <li>Set MONGO_URI (e.g. a local MongoDB or Atlas connection string).</li>
          <li>
            Run scripts/backend/app.py and keep it running; it will host HLS and the REST API on port 5000 by default.
          </li>
        </ol>

        <h2>Starting a Stream</h2>
        <p>
          In the UI, provide an RTSP URL and a stream key, then click <em>Start Stream</em>. The backend spawns FFmpeg,
          writing HLS output to <code>/hls/&lt;stream_key&gt;</code> and serves <code>index.m3u8</code> at
          <code>{"/hls/<stream_key>/index.m3u8"}</code>.
        </p>

        <h2>REST API</h2>
        <h3>List Overlays</h3>
        <pre>
          <code>GET /api/overlays?stream_key=&lt;key&gt;</code>
        </pre>

        <h3>Create Overlay</h3>
        <pre>
          <code>
            POST /api/overlays Content-Type: application/json
            {{
              stream_key: "default",
              type: "text", // or "image"
              x: 24,
              y: 24,
              width: 200,
              height: 60,
              opacity: 1,
              text: "Live",
              color: "#fff",
              bgColor: "rgba(0,0,0,0.2)",
              fontSize: 20,
              url: "https://example.com/logo.png",
              alt: "logo",
            }}
          </code>
        </pre>

        <h3>Update Overlay</h3>
        <pre>
          <code>PUT /api/overlays/&lt;id&gt;</code>
        </pre>

        <h3>Delete Overlay</h3>
        <pre>
          <code>DELETE /api/overlays/&lt;id&gt;</code>
        </pre>

        <h3>Stream Control</h3>
        <pre>
          <code>
            POST /api/stream/start Content-Type: application/json
            {{ stream_key: "default", rtsp_url: "rtsp://..." }}
            POST /api/stream/stop Content-Type: application/json
            {{ stream_key: "default" }}
          </code>
        </pre>

        <h2>Notes</h2>
        <ul>
          <li>Overlays are rendered client-side over the video element; positions use pixels from the top-left.</li>
          <li>Use CORS-enabled Flask (already included) so the frontend can access the API and HLS.</li>
        </ul>
      </div>
    </main>
  )
}
