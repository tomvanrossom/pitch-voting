import { QRCodeSVG } from 'qrcode.react'
import { Box } from '@mui/material'

export function QRCodeDisplay({ code, baseUrl, size = 160 }) {
  const joinUrl = `${baseUrl}?join=${code}`

  return (
    <Box
      component="figure"
      sx={{ m: 0, display: 'inline-block' }}
      aria-label={`QR code to join session ${code}`}
    >
      <QRCodeSVG value={joinUrl} size={size} />
    </Box>
  )
}
