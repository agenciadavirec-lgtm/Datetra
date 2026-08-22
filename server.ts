import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface PairingSession {
  code: string;
  qrToken: string;
  createdAt: number;
  expiresAt: number;
  sourceDevice: {
    id: string;
    name: string;
    type: string;
    ip: string;
  };
  status: "pending" | "accepted" | "rejected" | "expired";
}

const pairingSessions = new Map<string, PairingSession>();

// In-memory buffer store for transferred files in LAN session
const fileStore = new Map<string, {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  data: string; // base64 or text data
  sourceDevice: string;
  targetDevice: string;
  timestamp: number;
}>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "online",
      service: "DataBridge Transfer Local Service",
      version: "2.4.0",
      protocol: "v2.1",
      timestamp: Date.now()
    });
  });

  // Discovery info
  app.get("/api/discovery/network-info", (_req, res) => {
    res.json({
      networkName: "Wi-Fi 6 (5 GHz)",
      gateway: "192.168.1.1",
      localIp: "192.168.1.105",
      subnet: "255.255.255.0",
      broadcastPort: 5353,
      tcpTransferPort: 8765,
      encryption: "TLS 1.3 + AES-256-GCM",
      status: "active"
    });
  });

  // Generate 6-digit PIN & QR token
  app.post("/api/pairing/create", (req, res) => {
    const { deviceId, deviceName, deviceType } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const qrToken = "dbridge_" + Math.random().toString(36).substring(2, 12) + "_" + Date.now();
    const now = Date.now();
    const expiresAt = now + 5 * 60 * 1000; // 5 minutes

    const session: PairingSession = {
      code,
      qrToken,
      createdAt: now,
      expiresAt,
      sourceDevice: {
        id: deviceId || "pc-host",
        name: deviceName || "DataBridge Host",
        type: deviceType || "windows",
        ip: "192.168.1.105"
      },
      status: "pending"
    };

    pairingSessions.set(code, session);
    pairingSessions.set(qrToken, session);

    res.json({
      success: true,
      code,
      qrToken,
      expiresAt,
      ttlSeconds: 300
    });
  });

  // Verify PIN or QR token
  app.post("/api/pairing/verify", (req, res) => {
    const { tokenOrPin, connectingDevice } = req.body;
    if (!tokenOrPin) {
      return res.status(400).json({ error: "Token ou PIN não informado" });
    }

    const session = pairingSessions.get(tokenOrPin.toString().trim());
    if (!session) {
      return res.status(404).json({ error: "Código ou QR inválido ou não encontrado." });
    }

    if (Date.now() > session.expiresAt) {
      session.status = "expired";
      return res.status(410).json({ error: "Este código expirou. Gere um novo código no dispositivo." });
    }

    session.status = "accepted";
    res.json({
      success: true,
      message: "Dispositivo emparelhado com sucesso!",
      session: {
        hostDevice: session.sourceDevice,
        connectingDevice: connectingDevice || { name: "Cliente Remoto", type: "mobile" },
        sessionKey: "sec_key_" + Math.random().toString(36).substring(2, 15),
        protocolVersion: "2.1"
      }
    });
  });

  // Upload transferred file to local store
  app.post("/api/transfer/upload", (req, res) => {
    const { id, name, size, mimeType, data, sourceDevice, targetDevice } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Nome do arquivo é obrigatório" });
    }

    const fileId = id || "file_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    fileStore.set(fileId, {
      id: fileId,
      name,
      size: size || 0,
      mimeType: mimeType || "application/octet-stream",
      data: data || "",
      sourceDevice: sourceDevice || "Remoto",
      targetDevice: targetDevice || "Local",
      timestamp: Date.now()
    });

    res.json({
      success: true,
      fileId,
      message: "Arquivo recebido com sucesso no DataBridge Local Storage"
    });
  });

  // Get file info/data
  app.get("/api/transfer/file/:id", (req, res) => {
    const file = fileStore.get(req.params.id);
    if (!file) {
      return res.status(404).json({ error: "Arquivo não encontrado no cache local" });
    }
    res.json(file);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DataBridge Transfer Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
