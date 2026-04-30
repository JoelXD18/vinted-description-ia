'use client'

import { useState, useRef } from 'react'
import styles from './page.module.css'

const TALLAS = ['XS','S','M','L','XL','XXL','34','36','38','40','42','44','46','36EU','37EU','38EU','39EU','40EU','41EU','42EU','43EU','44EU','45EU']
const ESTADOS = [
  { valor: 'nuevo',        label: '✨ Nuevo con etiqueta' },
  { valor: 'como_nuevo',   label: '🌟 Como nuevo' },
  { valor: 'buen_estado',  label: '👍 Buen estado' },
  { valor: 'aceptable',    label: '🆗 Aceptable' },
]
const ESTILOS = [
  { valor: 'cercano', label: '🙂 Cercano' },
  { valor: 'directo', label: '📋 Directo' },
  { valor: 'emojis',  label: '🎉 Con emojis' },
]

export default function Home() {
  const [imagen, setImagen]           = useState(null)
  const [preview, setPreview]         = useState(null)
  const [talla, setTalla]             = useState('')
  const [estado, setEstado]           = useState('buen_estado')
  const [estilo, setEstilo]           = useState('cercano')
  const [precio, setPrecio]           = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [cargando, setCargando]       = useState(false)
  const [error, setError]             = useState('')
  const [copiado, setCopiado]         = useState(false)
  const fileRef = useRef()

  function handleFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPreview(ev.target.result)
      setImagen(ev.target.result)
      setDescripcion('')
      setError('')
    }
    reader.readAsDataURL(file)
  }

  async function generar() {
    if (!imagen) { setError('Sube una foto primero'); return }
    setCargando(true)
    setError('')
    setDescripcion('')
    try {
      const res = await fetch('/api/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagen, talla, estado, estilo, precio }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setDescripcion(data.descripcion)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  async function copiar() {
    await navigator.clipboard.writeText(descripcion)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <main className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>✦</span>
          <span className={styles.logoText}>VintedDescribe</span>
        </div>
        <p className={styles.tagline}>Genera descripciones con IA</p>
      </header>

      <div className={styles.container}>

        {/* Zona de foto */}
        <section className={styles.card}>
          <label className={styles.sectionLabel}>Foto de la prenda</label>
          <div
            className={`${styles.dropzone} ${preview ? styles.dropzoneWithImage : ''}`}
            onClick={() => fileRef.current.click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" className={styles.preview} />
            ) : (
              <div className={styles.dropzonePlaceholder}>
                <span className={styles.dropzoneIcon}>📸</span>
                <span className={styles.dropzoneText}>Toca para subir foto</span>
                <span className={styles.dropzoneSub}>Desde cámara o galería</span>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFoto}
            style={{ display: 'none' }}
          />
          {preview && (
            <button className={styles.btnCambiar} onClick={() => fileRef.current.click()}>
              Cambiar foto
            </button>
          )}
        </section>

        {/* Detalles */}
        <section className={styles.card}>
          <label className={styles.sectionLabel}>Detalles</label>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Talla <span className={styles.optional}>(opcional)</span></label>
            <div className={styles.tallasGrid}>
              {TALLAS.map(t => (
                <button
                  key={t}
                  className={`${styles.chip} ${talla === t ? styles.chipActive : ''}`}
                  onClick={() => setTalla(talla === t ? '' : t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Estado</label>
            <div className={styles.estadoGrid}>
              {ESTADOS.map(e => (
                <button
                  key={e.valor}
                  className={`${styles.estadoBtn} ${estado === e.valor ? styles.estadoBtnActive : ''}`}
                  onClick={() => setEstado(e.valor)}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Precio <span className={styles.optional}>(opcional)</span></label>
            <div className={styles.precioInput}>
              <input
                type="number"
                placeholder="0"
                value={precio}
                onChange={e => setPrecio(e.target.value)}
                className={styles.input}
              />
              <span className={styles.precioEuro}>€</span>
            </div>
          </div>
        </section>

        {/* Estilo */}
        <section className={styles.card}>
          <label className={styles.sectionLabel}>Estilo de descripción</label>
          <div className={styles.estiloGrid}>
            {ESTILOS.map(e => (
              <button
                key={e.valor}
                className={`${styles.estiloBtn} ${estilo === e.valor ? styles.estiloBtnActive : ''}`}
                onClick={() => setEstilo(e.valor)}
              >
                {e.label}
              </button>
            ))}
          </div>
        </section>

        {/* Botón generar */}
        <button
          className={`${styles.btnGenerar} ${cargando ? styles.btnGenerarLoading : ''}`}
          onClick={generar}
          disabled={cargando || !imagen}
        >
          {cargando ? (
            <span className={styles.loadingRow}>
              <span className={styles.spinner}></span>
              Analizando prenda...
            </span>
          ) : (
            '✨ Generar descripción'
          )}
        </button>

        {/* Error */}
        {error && (
          <div className={styles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        {/* Resultado */}
        {descripcion && (
          <section className={`${styles.card} ${styles.resultCard}`}>
            <div className={styles.resultHeader}>
              <label className={styles.sectionLabel}>Descripción generada</label>
              <button
                className={`${styles.btnCopiar} ${copiado ? styles.btnCopiado : ''}`}
                onClick={copiar}
              >
                {copiado ? '✅ Copiado' : '📋 Copiar'}
              </button>
            </div>
            <p className={styles.descripcionTexto}>{descripcion}</p>
            <button className={styles.btnRegenerar} onClick={generar}>
              🔄 Regenerar
            </button>
          </section>
        )}

      </div>

      <footer className={styles.footer}>
        <p>Powered by Google Gemini · Para uso personal</p>
      </footer>
    </main>
  )
}
