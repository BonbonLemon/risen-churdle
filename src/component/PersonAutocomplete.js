import React, { useState } from "react";
import useGoogleSheets from "use-google-sheets";

import "./PersonAutocomplete.scss";

import Guesses from "./Guesses";
import { Modal } from "react-bootstrap";

const SPREADSHEET_ID = "1twAQMXJnsdAJ8IGeRJnYRBvYUWZCrSGUsXmymm1fZR8";
const API_KEY = "AIzaSyAG4n2KFUfOLJizmk9NhNOtXo2ZcQO8z4g";
const SPREADSHEET_NAME = "Form Responses 1";

const PersonAutocomplete = () => {
  const [input, setInput] = useState("");
  const [people, setPeople] = useState([]);
  const [answerPerson, setAnswerPerson] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [isSolved, setIsSolved] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { data, loading, error } = useGoogleSheets({
    apiKey: API_KEY,
    sheetId: SPREADSHEET_ID,
    sheetsNames: [SPREADSHEET_NAME],
  });
  let peopleData;
  if (!loading && !error && people.length === 0) {
    peopleData = data[0].data;
    setPeople(peopleData);
    setAnswerPerson(peopleData[Math.floor(Math.random() * peopleData.length)]);
  }

  const updateInput = (e) => {
    setInput(e.currentTarget.value);
  };

  const createAutocomplete = () => {
    const autocompletePeople = people.filter((person) => {
      return person["Name"].toLowerCase().indexOf(input.toLowerCase()) !== -1;
    });

    return (
      <div className="autocomplete-list">
        {autocompletePeople.map((person, idx) => {
          const indexOfInput = person["Name"]
            .toLowerCase()
            .indexOf(input.toLowerCase());
          return (
            <div
              className={`person ${
                focus % autocompletePeople.length === idx && focus !== -1
                  ? "focus"
                  : ""
              }`}
              onClick={() => selectPerson(person)}
              onMouseEnter={() => setFocus(idx)}
              key={idx}
            >
              {person["Name"].substr(0, indexOfInput)}
              <strong>
                {person["Name"].substr(indexOfInput, input.length)}
              </strong>
              {person["Name"].substr(indexOfInput + input.length)}
            </div>
          );
        })}
      </div>
    );
  };

  const selectPerson = (person) => {
    setInput("");
    setGuesses((guesses) => [...guesses, person]);
    if (person === answerPerson) {
      setIsSolved(true);
      setShowModal(true);
    }
  };

  const [focus, setFocus] = useState(-1);

  const updateFocus = (e) => {
    const autocompletePeople = people.filter((person) => {
      return person["Name"].toLowerCase().indexOf(input.toLowerCase()) !== -1;
    });
    if (e.keyCode === 40) {
      // DOWN
      setFocus(
        (focus + 1 + autocompletePeople.length) % autocompletePeople.length
      );
    } else if (e.keyCode === 38) {
      // UP
      setFocus(
        (focus - 1 + autocompletePeople.length) % autocompletePeople.length
      );
    } else if (e.keyCode === 13) {
      // ENTER
      e.preventDefault();
      selectPerson(autocompletePeople[focus]);
    } else {
      setFocus(0);
    }
  };

  const [isFocused, setIsFocused] = useState(false);

  const handleBlur = () => {
    setFocus(0);
    setIsFocused(false);
  };

  const handleCloseModal = () => setShowModal(false);

  return (
    <div>
      <div className="autocomplete">
        <input
          className="person-input"
          type="text"
          onChange={updateInput}
          onKeyDown={updateFocus}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder={
            isSolved
              ? `You guessed it in ${guesses.length}!`
              : `Guess ${guesses.length + 1} of 8`
          }
          value={input}
        />
        {input.length > 0 && isFocused ? createAutocomplete() : ""}
      </div>
      <Guesses answerPerson={answerPerson} guesses={guesses} />
      <Modal centered show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{answerPerson ? answerPerson["Name"] : ""}</Modal.Title>
        </Modal.Header>
        <Modal.Body>You solved it in {guesses.length} guesses!</Modal.Body>
      </Modal>
    </div>
  );
};

export default PersonAutocomplete;
