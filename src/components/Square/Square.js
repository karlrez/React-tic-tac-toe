import React from 'react';

function Square(props) {
    return (
        // When a square is clicked, React will call the handleCLick
        // in Board class
        <button
            className={props.className}
            onClick={props.onClick}>
            {props.value}
        </button>
    )
}

export default Square;