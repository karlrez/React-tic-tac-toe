import React from 'react';
import classes from './Square.Module.css';

function Square(props) {
    return (
        // When a square is clicked, React will call the handleCLick
        // in Board class
        <button
            className={classes.square}
            onClick={props.onClick}>
            {props.value}
        </button>
    )
}

export default Square;