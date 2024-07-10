import React, { useState } from "react";
import NoteContext from "../context/notes/NotesContext";
import { useContext } from "react";
const AddNote = (props) => {
  const context = useContext(NoteContext);
  const { addNote } = context;
  const [note, setNote] = useState({ title: " ", description: " ", tag: " " });

  const handClick = (e) => {
    e.preventDefault();
    addNote(note.title, note.description, note.tag);
    setNote({ title: " ", description: " ", tag: " " });
    props.showAlert("Addedd Succesfully", "Success");
  };

  const onChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value });
  };

  return (
    <>
      <div className="container my-3">
        <h2 className="text-center">Add Note</h2>
        <form action="" className="container">
          <div className="mb-3">
            <label htmlfor="tttle" className="form-label">
              Title
            </label>
            <input
              type="text"
              className="form-control"
              id="title"
              name="title"
              aria-describedby="emailHelp"
              value={note.title}
              onChange={onChange}
            />
          </div>
          <div className="mb-3">
            <label htmlfor="desc" className="form-label">
              Description
            </label>
            <input
              type="text"
              className="form-control"
              id="description"
              name="description"
              value={note.description}
              onChange={onChange}
            />
          </div>
          <div className="mb-3">
            <label htmlfor="tag" className="form-label">
              Tag
            </label>
            <input
              type="text"
              className="form-control"
              id="tag"
              name="tag"
              value={note.tag}
              onChange={onChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={note.title.length < 5 || note.description.length < 5}
            onClick={handClick}
          >
            Add Note
          </button>
        </form>
      </div>
    </>
  );
};

export default AddNote;
