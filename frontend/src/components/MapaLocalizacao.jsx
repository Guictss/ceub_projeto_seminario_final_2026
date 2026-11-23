import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Box, Typography } from "@mui/material";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ── Coordenadas e metadados da sede ──────────────────────────────────────
const SEDE = {
  lat: -15.832232,
  lng: -47.890623,
  nome: "Programa Vela Para Todos",
  local: "Clube Cultural e Recreativo Nipo Brasileiro",
  logradouro: "SCES Sul, Trecho 1, Lote 1",
  cidade: "Brasília — DF",
};

// Caixa delimitadora cobrindo o DF (do Planaltina ao Santa Maria,
// do Paranoá ao Ceilândia) — o usuário não consegue arrastar/dar zoom out
// além desses limites.
const LIMITES_BRASILIA = [
  [-16.10, -48.30], // canto sudoeste
  [-15.50, -47.50], // canto nordeste
];

// ── Ícone personalizado (círculo amarelo + veleiro azul + pin) ───────────
const iconeFBVA = L.divIcon({
  className: "", // zera estilos default pra não conflitar
  html: `
    <div style="position: relative; width: 48px; height: 62px;">
      <!-- Círculo amarelo com borda azul -->
      <div style="
        position: absolute; top: 0; left: 0;
        width: 48px; height: 48px;
        background: #fde100;
        border: 3px solid #662c92;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 10px rgba(0,0,0,0.35);
      ">
        <!-- SVG de veleiro -->
        <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="#43054e">
          <path d="M11 3 L11 15 L4 15 Z"/>
          <path d="M13 6 L13 15 L19 15 Z"/>
          <path d="M3 16.5 L21 16.5 L19 20 L5 20 Z"/>
        </svg>
      </div>
      <!-- Pin apontando pra baixo -->
      <div style="
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 0; height: 0;
        border-left: 9px solid transparent;
        border-right: 9px solid transparent;
        border-top: 14px solid #fde100;
        filter: drop-shadow(0 2px 2px rgba(0,0,0,0.25));
      "></div>
    </div>
  `,
  iconSize: [48, 62],
  iconAnchor: [24, 62],
  popupAnchor: [0, -60],
});

export default function MapaLocalizacao() {
  return (
    <Box
      sx={{
        width: "100%",
        height: { xs: 300, md: 400 },
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        border: "4px solid #fde100",
      }}
    >
      <MapContainer
        center={[SEDE.lat, SEDE.lng]}
        zoom={16}
        minZoom={11}
        maxZoom={19}
        maxBounds={LIMITES_BRASILIA}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={false}
        worldCopyJump={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap={true}
        />
        <Marker position={[SEDE.lat, SEDE.lng]} icon={iconeFBVA}>
          <Popup>
            <Box sx={{ minWidth: 220 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: "#662c92", fontWeight: 700, mb: 0.5 }}
              >
                {SEDE.nome}
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                {SEDE.local}
                <br />
                {SEDE.logradouro}
                <br />
                {SEDE.cidade}
              </Typography>
            </Box>
          </Popup>
        </Marker>
      </MapContainer>
    </Box>
  );
}
