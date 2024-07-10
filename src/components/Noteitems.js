import React from "react";
import { useContext } from "react";
import NoteContext from "../context/notes/NotesContext";

const Noteitems = (props) => {
  const context = useContext(NoteContext);
  const { deleteNote } = context;
  const { notes, updateNote } = props;
  return (
    <>
      <div className="col-md-3">
        <div className="card my-3" style={{ width: "18rem" }}>
          <div className="card-body">
            <div className="d-flex align-items-center">
              <h5 className="card-title"> {notes.title}</h5>
              <i
                className="fa-sharp fa-solid fa-trash mx-2"
                onClick={() => {
                  deleteNote(notes._id);
                  props.showAlert("Deleted Succesfully", "Success");
                }}
              ></i>
              <i
                className="fa-solid fa-pen-to-square mx-2"
                onClick={() => {
                  updateNote(notes);
                }}
              ></i>
            </div>
            <p className="card-text">{notes.description}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Noteitems;
