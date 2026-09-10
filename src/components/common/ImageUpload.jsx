import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  Link,
  Check,
  RefreshCw,
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Sliders,
  CheckCircle
} from 'lucide-react';
import { Modal } from './Modal';

export const ImageUpload = ({
  value,
  onChange,
  label = 'Upload Image',
  aspectRatio = '16/9', // '16/9', '1/1', '4/3', 'free'
  placeholder = 'Select an image from device or drop here...',
  presets = []
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlText, setUrlText] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Crop & Adjustment Modal State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null); // base64 / URL
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedRatio, setSelectedRatio] = useState(aspectRatio);

  const canvasRef = useRef(null);
  const imageObjRef = useRef(null);

  // Target aspect ratio width/height ratio
  const getRatioValue = useCallback((ratio) => {
    if (ratio === '1/1') return 1;
    if (ratio === '16/9') return 16 / 9;
    if (ratio === '4/3') return 4 / 3;
    return 16 / 9;
  }, []);

  // Handle incoming file selection
  const handleFile = (file) => {
    setError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP, SVG, GIF)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('Image size exceeds 8MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      openCropEditor(e.target.result);
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  // Open the Crop Editor modal
  const openCropEditor = (imgSrc) => {
    setImageToCrop(imgSrc);
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
    setSelectedRatio(aspectRatio);
    setCropModalOpen(true);
  };

  // Load image object whenever imageToCrop changes
  useEffect(() => {
    if (!imageToCrop || !cropModalOpen) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageObjRef.current = img;
      renderCanvas();
    };
    img.src = imageToCrop;
  }, [imageToCrop, cropModalOpen]);

  // Render crop preview on canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Dark checkerboard background pattern
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    // Center point for transformations
    ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Calculate base draw dimensions to fit viewport
    const imgRatio = img.naturalWidth / img.naturalHeight;
    let drawW = width;
    let drawH = width / imgRatio;

    if (drawH < height) {
      drawH = height;
      drawW = height * imgRatio;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Draw Grid Lines overlay for framing
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // 1/3 horizontal
    ctx.beginPath();
    ctx.moveTo(0, height / 3);
    ctx.lineTo(width, height / 3);
    ctx.moveTo(0, (height * 2) / 3);
    ctx.lineTo(width, (height * 2) / 3);

    // 1/3 vertical
    ctx.moveTo(width / 3, 0);
    ctx.lineTo(width / 3, height);
    ctx.moveTo((width * 2) / 3, 0);
    ctx.lineTo((width * 2) / 3, height);
    ctx.stroke();

    // Corner guides
    ctx.strokeStyle = 'var(--primary, #6366f1)';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    const cornerSize = 20;

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(0, cornerSize);
    ctx.lineTo(0, 0);
    ctx.lineTo(cornerSize, 0);
    // Top-Right
    ctx.moveTo(width - cornerSize, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, cornerSize);
    // Bottom-Left
    ctx.moveTo(0, height - cornerSize);
    ctx.lineTo(0, height);
    ctx.lineTo(cornerSize, height);
    // Bottom-Right
    ctx.moveTo(width - cornerSize, height);
    ctx.lineTo(width, height);
    ctx.lineTo(width, height - cornerSize);
    ctx.stroke();

    ctx.restore();
  }, [pan, zoom, rotation]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Pan / Drag Handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Handlers for Mobile / Touchscreens
  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !e.touches || !e.touches[0]) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Rotate 90 deg clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3.5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetAdjustments = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  // Apply Crop and output base64 data URL
  const handleApplyCrop = () => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const ratioVal = getRatioValue(selectedRatio);
    const targetW = selectedRatio === '1/1' ? 600 : 960;
    const targetH = Math.round(targetW / ratioVal);

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = targetW;
    exportCanvas.height = targetH;
    const exportCtx = exportCanvas.getContext('2d');

    exportCtx.fillStyle = '#ffffff';
    exportCtx.fillRect(0, 0, targetW, targetH);

    exportCtx.save();
    // Translate with ratio scaling
    const scaleFactor = targetW / canvas.width;
    exportCtx.translate(targetW / 2 + pan.x * scaleFactor, targetH / 2 + pan.y * scaleFactor);
    exportCtx.rotate((rotation * Math.PI) / 180);
    exportCtx.scale(zoom * scaleFactor, zoom * scaleFactor);

    const imgRatio = img.naturalWidth / img.naturalHeight;
    let drawW = canvas.width;
    let drawH = canvas.width / imgRatio;

    if (drawH < canvas.height) {
      drawH = canvas.height;
      drawW = canvas.height * imgRatio;
    }

    exportCtx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    exportCtx.restore();

    const croppedDataUrl = exportCanvas.toDataURL('image/jpeg', 0.92);
    onChange(croppedDataUrl);
    setCropModalOpen(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (!urlText.trim()) return;
    openCropEditor(urlText.trim());
    setUrlText('');
    setShowUrlInput(false);
  };

  // Viewport dimensions based on aspect ratio
  const canvasWidth = 460;
  const canvasHeight = Math.round(canvasWidth / getRatioValue(selectedRatio));

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}

      {value ? (
        /* Preview Card with Crop / Adjust action */
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src={value}
            alt="Preview"
            style={{
              width: '100%',
              maxHeight: aspectRatio === '1/1' ? '180px' : '220px',
              objectFit: 'cover',
              display: 'block'
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              display: 'flex',
              gap: '0.4rem'
            }}
          >
            <button
              type="button"
              onClick={() => openCropEditor(value)}
              className="btn btn-secondary btn-sm"
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                color: '#ffffff',
                backdropFilter: 'blur(8px)',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                border: 'none'
              }}
              title="Crop, Move & Adjust Image"
            >
              <Crop size={13} /> Crop & Move
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary btn-sm"
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                color: '#ffffff',
                backdropFilter: 'blur(8px)',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                border: 'none'
              }}
              title="Replace with new file"
            >
              <RefreshCw size={13} /> Replace
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="btn btn-danger btn-sm"
              style={{
                background: 'rgba(239, 68, 68, 0.85)',
                color: '#ffffff',
                backdropFilter: 'blur(8px)',
                padding: '0.35rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none'
              }}
              title="Remove Image"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        /* Modern Drag & Drop File Zone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: dragOver ? '2px dashed var(--primary)' : '2px dashed var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1.75rem 1.25rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragOver ? 'var(--primary-light)' : 'var(--bg-tertiary)',
            transition: 'all var(--transition-fast)'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem'
            }}
          >
            <UploadCloud size={24} />
          </div>

          <div style={{ fontWeight: 700, fontSize: '0.925rem', marginBottom: '0.25rem' }}>
            Click to upload or drag & drop file
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Supports PNG, JPG, WebP, GIF • Includes built-in interactive Cropping & Moving tool
          </div>
        </div>
      )}

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {error && (
        <div style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '0.4rem', fontWeight: 500 }}>
          {error}
        </div>
      )}

      {/* Secondary URL toggle or preset gallery */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <Link size={12} /> {showUrlInput ? 'Hide Web URL Input' : 'Or paste Web Image URL'}
        </button>

        {presets && presets.length > 0 && (
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Presets:</span>
            {presets.map((p, idx) => {
              const url = typeof p === 'string' ? p : p.url;
              const name = typeof p === 'string' ? `Preset ${idx + 1}` : p.name;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => openCropEditor(url)}
                  className="badge badge-outline"
                  style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', cursor: 'pointer' }}
                >
                  {name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {showUrlInput && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input
            type="text"
            className="form-control"
            placeholder="https://images.unsplash.com/..."
            value={urlText}
            onChange={(e) => setUrlText(e.target.value)}
            style={{ fontSize: '0.85rem' }}
          />
          <button type="button" onClick={handleUrlSubmit} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.75rem' }}>
            Crop & Adjust URL
          </button>
        </div>
      )}

      {/* ================= INTERACTIVE CROP & MOVE MODAL ================= */}
      <Modal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        title="Crop, Move & Adjust Image"
        size="md"
      >
        <div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
            Click and drag to reposition the image. Use the slider or buttons to zoom and rotate.
          </div>

          {/* Interactive Canvas Viewport */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#090d16',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              overflow: 'hidden',
              userSelect: 'none',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              style={{
                borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                maxWidth: '100%',
                height: 'auto',
                touchAction: 'none'
              }}
            />
          </div>

          {/* Controls: Zoom, Rotate, Ratio, Reset */}
          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Zoom Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ZoomIn size={14} /> Zoom Level
                </span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.25rem 0.5rem' }}
                >
                  <ZoomOut size={14} />
                </button>
                <input
                  type="range"
                  min="0.5"
                  max="3.5"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--primary)' }}
                />
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.25rem 0.5rem' }}
                >
                  <ZoomIn size={14} />
                </button>
              </div>
            </div>

            {/* Quick Action Buttons: Rotate, Ratio Selector, Reset */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleRotate}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.8rem' }}
                >
                  <RotateCw size={13} /> Rotate 90° ({rotation}°)
                </button>

                <button
                  type="button"
                  onClick={handleResetAdjustments}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.8rem' }}
                >
                  <RefreshCw size={13} /> Reset View
                </button>
              </div>

              {/* Ratio Selector */}
              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ratio:</span>
                {['16/9', '1/1', '4/3'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRatio(r)}
                    className={`btn btn-sm ${selectedRatio === r ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '1.25rem 0 0', borderTop: '1px solid var(--border-color)', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setCropModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              className="btn btn-primary"
            >
              <Check size={16} /> Apply Crop & Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ImageUpload;
