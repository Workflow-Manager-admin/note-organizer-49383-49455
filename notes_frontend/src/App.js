import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import './notes-app.css';

// Color palette
const PRIMARY = "#1976d2";
const ACCENT = "#ffd600";
const SECONDARY = "#424242";

// Helper: Get notes from localStorage
function getStoredNotes() {
  const item = localStorage.getItem("notes_app_notes");
  if (!item) return [];
  try {
    return JSON.parse(item);
  } catch {
    return [];
  }
}

// Helper: Save notes to localStorage
function storeNotes(notes) {
  localStorage.setItem("notes_app_notes", JSON.stringify(notes));
}

/**
 * PUBLIC_INTERFACE
 * Main Notes App component
 */
function App() {
  // Notes state: array of {id, title, content, created, updated}
  const [notes, setNotes] = useState([]);
  // Form state
  const [editingId, setEditingId] = useState(null); // null = creating, id = editing
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Focus first field when form opens
  const inputRef = useRef(null);

  // On mount, load notes
  useEffect(() => {
    setNotes(getStoredNotes());
  }, []);

  // Store notes when changed
  useEffect(() => {
    storeNotes(notes);
  }, [notes]);

  // Focus on form open
  useEffect(() => {
    if (showForm && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showForm, editingId]);

  // PUBLIC_INTERFACE
  /** Open form for create or edit */
  function openForm(note = null) {
    if (note) {
      setEditingId(note.id);
      setFormTitle(note.title);
      setFormContent(note.content);
    } else {
      setEditingId(null);
      setFormTitle('');
      setFormContent('');
    }
    setShowForm(true);
  }

  // PUBLIC_INTERFACE
  /** Add or update note on form submit */
  function handleFormSubmit(e) {
    e.preventDefault();
    const titleTrim = formTitle.trim();
    const contentTrim = formContent.trim();
    if (!titleTrim && !contentTrim) return; // Don't save empty notes

    if (editingId === null) {
      // Create new note
      const newNote = {
        id: Date.now() + '-' + Math.random().toString(36).substr(2, 6),
        title: titleTrim,
        content: contentTrim,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      };
      setNotes([newNote, ...notes]);
    } else {
      // Edit existing
      setNotes(notes.map(n => n.id === editingId
        ? { ...n, title: titleTrim, content: contentTrim, updated: new Date().toISOString() }
        : n
      ));
    }
    setShowForm(false);
    setFormTitle('');
    setFormContent('');
    setEditingId(null);
  }

  // PUBLIC_INTERFACE
  /** Trigger edit mode for note */
  function handleEdit(note) {
    openForm(note);
  }

  // PUBLIC_INTERFACE
  /** Delete note */
  function handleDelete(id) {
    if (window.confirm("Delete this note?")) {
      setNotes(notes.filter(n => n.id !== id));
      // If the note being edited is deleted, close the form
      if (editingId === id) {
        setShowForm(false);
        setEditingId(null);
      }
    }
  }

  // PUBLIC_INTERFACE
  /** Open form to create note */
  function handleFABClick() {
    openForm();
  }

  // Format date for created/updated
  function fmtDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: "2-digit", minute: "2-digit" });
  }

  // UI: Header
  function Header() {
    return (
      <header className="notes-header" style={{background: PRIMARY, color: "#fff"}}>
        <h1 className="notes-title" style={{marginBottom: 0}}>Notes</h1>
        <span className="notes-sub" style={{color: ACCENT, fontWeight: 500}}>Organize and manage your notes</span>
      </header>
    );
  }

  // UI: Notes List
  function NoteList() {
    if (notes.length === 0) {
      return (
        <div style={{
          color: SECONDARY,
          opacity: 0.8,
          textAlign: 'center',
          marginTop: '2.5rem',
          fontSize: '1.12rem'
        }}>No notes yet. Click the <b>+</b> below to get started!</div>
      );
    }
    return (
      <ul className="notes-list">
        {notes.map(note => (
          <li className="note-card" key={note.id}>
            <div className="note-card-content">
              <div className="note-meta">
                <span className="note-date">{fmtDate(note.updated)}</span>
                {note.updated !== note.created && <span className="note-modified">(edited)</span>}
              </div>
              <h2 className="note-title">{note.title || <em>(Untitled)</em>}</h2>
              <p className="note-body">{note.content || <span className="placeholder-text">(No content)</span>}</p>
            </div>
            <div className="note-actions">
              <button aria-label="Edit" className="note-btn edit" style={{color: PRIMARY}} onClick={() => handleEdit(note)}>Edit</button>
              <button aria-label="Delete" className="note-btn delete" style={{color: SECONDARY}} onClick={() => handleDelete(note.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  // UI: Note Form
  function NoteForm() {
    return (
      <div className="note-form-modal">
        <form className="note-form paper" style={{borderColor: PRIMARY}} onSubmit={handleFormSubmit} autoComplete="off">
          <h2 style={{color: PRIMARY, marginTop: 0, marginBottom: "0.8rem"}}>{editingId ? "Edit Note" : "Create Note"}</h2>
          <input
            ref={inputRef}
            className="note-input"
            style={{borderColor: PRIMARY}}
            placeholder="Title"
            maxLength={100}
            value={formTitle}
            onChange={e => setFormTitle(e.target.value)}
            aria-label="Note title"
          />
          <textarea
            className="note-textarea"
            style={{borderColor: ACCENT}}
            rows={5}
            placeholder="Write your note here..."
            maxLength={1000}
            value={formContent}
            onChange={e => setFormContent(e.target.value)}
            aria-label="Note content"
          />
          <div className="form-actions">
            <button type="submit" className="form-btn primary" style={{background: PRIMARY, color: "#fff"}}>{editingId ? "Update" : "Add"} Note</button>
            <button type="button" className="form-btn cancel" onClick={() => setShowForm(false)} style={{background: ACCENT, color: "#222"}}>Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  // UI: Floating Action Button
  function FAB() {
    return (
      <button
        aria-label="Add Note"
        className="fab"
        style={{
          background: PRIMARY,
          color: "#fff",
          borderRadius: "50%",
          width: 56,
          height: 56,
          position: "fixed",
          right: 24,
          bottom: 24,
          fontSize: 32,
          fontWeight: 700,
          border: "none",
          boxShadow: "0 3px 10px rgba(25, 118, 210, 0.1), 0 1.5px 5px #42424211",
          cursor: "pointer",
          transition: "background 0.23s"
        }}
        onClick={handleFABClick}
      >+</button>
    );
  }

  return (
    <div className="notes-app-shell" style={{background: "#fafbfc", minHeight: "100vh"}}>
      <Header />
      <main className="notes-main">
        <section className="notes-list-area">
          <NoteList />
        </section>
      </main>
      <FAB />
      {showForm && <NoteForm />}
      <footer className="notes-footer" style={{
        textAlign: "center",
        padding: "0.8rem 0 0.7rem",
        fontSize: "0.93rem",
        color: SECONDARY,
        background: "#f7f7fa"
      }}>
        &copy; {new Date().getFullYear()} Notes App &middot; Minimal UI Demo
      </footer>
    </div>
  );
}

export default App;
