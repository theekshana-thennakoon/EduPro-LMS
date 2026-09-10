import React from 'react';
import { Bookmark, Play, Trash2, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLms } from '../../context/LmsContext';

export const WatchLaterView = ({ onOpenClassroom, onNavigate }) => {
  const { watchLaterList, toggleWatchLater } = useLms();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Watch Later Videos</h1>
          <p>Bookmarked lectures and demonstrations saved for focused study and review.</p>
        </div>

        <div className="badge badge-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          {watchLaterList.length} {watchLaterList.length === 1 ? 'Video Saved' : 'Videos Saved'}
        </div>
      </div>

      {watchLaterList.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <Bookmark size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Your Watch Later Queue is Empty</h3>
          <p style={{ maxWidth: '480px', margin: '0 auto 1.5rem', color: 'var(--text-secondary)' }}>
            When watching or browsing lesson videos, click the "Watch Later" button to bookmark lectures for later study.
          </p>
          <button onClick={() => onNavigate('student-enrolled')} className="btn btn-primary">
            Go to My Classes
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {watchLaterList.map((vid) => (
            <div
              key={vid.id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                justifyContent: 'space-between'
              }}
            >
              <div>
                {/* Thumbnail / Header */}
                <div style={{ position: 'relative', height: '160px', background: 'var(--bg-tertiary)' }}>
                  {vid.thumbnail ? (
                    <img
                      src={vid.thumbnail}
                      alt={vid.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Play size={40} color="var(--text-muted)" />
                    </div>
                  )}

                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      background: 'rgba(0, 0, 0, 0.8)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      color: '#ffffff',
                      fontWeight: 700
                    }}
                  >
                    <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                    {vid.duration}
                  </div>
                </div>

                <div style={{ padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    {vid.className}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    {vid.title}
                  </h3>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    Module: {vid.lessonTitle}
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <button
                  onClick={() => onOpenClassroom(vid.classId, vid.lessonId)}
                  className="btn btn-primary btn-block btn-sm"
                >
                  <Play size={14} /> Resume Video
                </button>
                <button
                  onClick={() => toggleWatchLater(vid.id)}
                  className="btn btn-danger btn-sm"
                  style={{ padding: '0.45rem' }}
                  title="Remove from Watch Later"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
