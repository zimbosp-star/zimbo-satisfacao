import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { isAdminLogado } from '../data/auth.js'

export default function AdminQrCode() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const [link, setLink] = useState('')

  useEffect(() => {
    (async () => {
      if (!(await isAdminLogado())) {
        navigate('/admin')
        return
      }
      const url = `${window.location.origin}/avaliar`
      setLink(url)
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, url, {
          width: 320,
          margin: 2,
          color: { dark: '#241B17', light: '#FFFFFF' },
        })
      }
    })()
  }, [navigate])

  function baixar() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'zimbo-qrcode-avaliacao.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="page page--qrcode">
      <div className="qr-card">
        <Link to="/admin/painel" className="qr-card__voltar">← Voltar ao painel</Link>
        <h1>QR Code da pesquisa</h1>
        <p>
          Imprima e cole perto do caixa, ou coloque no cupom fiscal, para o
          cliente escanear com a câmera do celular e avaliar a compra.
        </p>
        <div className="qr-card__canvas">
          <canvas ref={canvasRef} />
        </div>
        <p className="qr-card__link">{link}</p>
        <div className="qr-card__acoes">
          <button className="btn btn--primary" onClick={baixar}>Baixar imagem (PNG)</button>
          <button className="btn btn--ghost" onClick={() => window.print()}>Imprimir</button>
        </div>
      </div>
    </div>
  )
}
