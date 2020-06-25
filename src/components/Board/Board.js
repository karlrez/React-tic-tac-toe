import React, { Component } from 'react';
import axios from '../../axios';

import Square from '../Square/Square';
//import Aux from '../../UI/Auxiliary/Auxiliary';
//import Modal from '../../UI/Modal/Modal';
import classes from '../Board/Board.module.css';
import refreshIcon from '../../Assets/refresh.png';

class Board extends Component {
    constructor(props) {
        super(props);
        this.state = {
            squares: Array(9).fill(null),
            xIsNext: true,
            score: null,
            winner: null
        };
    }

    componentWillMount() {
        this.getScore();
    }

    componentDidUpdate() {
        this.computerPlayer();
    }

    // i is position of square that was clicked
    // updates state with an X for that position
    // slice without params returns all elements, a copy of our state
    handleClick(i) {
        const squares = this.state.squares.slice();
        if (this.calculateWinner(squares, true) || squares[i]) {
            return;
        }
        //setting players values
        squares[i] = this.state.xIsNext ? 'X' : 'O';

        this.setState({
            squares: squares,
            xIsNext: !this.state.xIsNext,
            winner: this.calculateWinner(squares, true)
        });

    }

    // Passing a reference to the handleClick() method so square can change
    // Board's state
    renderSquare(i) {
        return (
            <Square
                className={this.state.squares[i] === 'X' ? classes.squarePlayer : classes.squareComputer}
                value={this.state.squares[i]}
                onClick={() => this.handleClick(i)} />
        );
    }

    calculateWinner(squares, updateState) {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                if (updateState) {
                    this.setState({
                        winner: true
                    });
                }
                return squares[a];
            }
        }
        //if no winner we check if board is full and call it a tie
        let emptySquares = false;
        for (let i = 0; i < 9; i++) {
            if (squares[i] == null) {
                emptySquares = true;
            }
        }
        if (emptySquares === false) {
            if (updateState) {
                this.setState({
                    winner: 'tie'
                });
            }
            return 'tie';
        } else return null;
    }

    getScore() {
        axios.get('https://react-my-burger-4a08e.firebaseio.com/score.json')
            .then(response => {
                console.log(response.data);
                this.setState({
                    score: response.data,
                });
            })
            .catch(error => {
                console.log(error);
            })
    }

    updateScore(state, winner) {
        console.log('updating');
        let updatedGamesPlayed = state.score.gamesPlayed + 1;
        let playerScore = state.score.player;
        let computerScore = state.score.computer;
        let updateTie = state.score.tie;

        if (winner === 'X') {
            playerScore = playerScore + 1;
        } else if (winner === 'O') {
            computerScore = computerScore + 1;
        } else if (winner === 'tie') {
            updateTie = updateTie + 1;
        }

        const update = {
            player: playerScore,
            computer: computerScore,
            gamesPlayed: updatedGamesPlayed,
            tie: updateTie
        }

        axios.patch('/score.json?', update)
            .then(response => {
                console.log(response.data);
            })
            .catch(error => {
                console.log(error.data);
            })

        this.setState({
            squares: Array(9).fill(null),
            xIsNext: this.state.xIsNext ? true : false,
            score: update,
            winner: null
        })
    }

    computerPlayer() {
        const squares = this.state.squares.slice();

        // check if its O's turn
        if (this.state.xIsNext || this.state.winner) {
            return;
        }

        //check if board is full
        let emptySquares = 0;
        for (let i = 0; i < squares.length; i++) {
            if (squares[i] == null) {
                emptySquares++;
            }
        }
        if (emptySquares < 1) {
            return;
        }

        // AI algorithm
        let squaresCopy = [...squares]; // spread operator to clone an array
        let bestScore = -Infinity;
        let bestMove;

        // calling miniMax function on all empty squares (for each possible move)        
        for (let i = 0; i < squaresCopy.length; i++) {
            if (squaresCopy[i] == null) {
                squaresCopy[i] = 'O';
                let score = this.miniMax(squaresCopy, 0, false);
                //console.log(score);
                squaresCopy[i] = null; //undoing move
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        // select bestMove and set state 
        squares[bestMove] = 'O';
        this.setState({
            squares: squares,
            xIsNext: true,
            winner: this.calculateWinner(squares, true)
        });
    }

    miniMax(squares, depth, isMaximizing) {
        const scores = {
            'O': 10,
            'X': -10,
            'tie': 0
        };
        let result = this.calculateWinner(squares, false);

        //console.log('depth= ' + depth + '| result= ' + result + '| scores= ' + scores[result]);

        if (result !== null) {
            return scores[result];
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < squares.length; i++) {
                if (squares[i] == null) {
                    squares[i] = 'O';
                    let score = this.miniMax(squares, depth + 1, false);
                    squares[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            //console.log('(isMax)' + bestScore)
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < squares.length; i++) {
                if (squares[i] == null) {
                    squares[i] = 'X';
                    let score = this.miniMax(squares, depth + 1, true);
                    squares[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            //console.log('(isMin)' + bestScore)
            return bestScore;
        }
    }

    render() {
        let showPlayAgain = false;
        let status;
        if (this.state.winner) {
            if (this.state.winner === 'tie') {
                status = "No Winner!"
                showPlayAgain = true;
            } else {
                status = this.state.winner + " Wins!";
                showPlayAgain = true;
            }
        } else {
            status = (this.state.xIsNext ? 'X' : 'O') + "'s turn";
        }

        let playAgainBtn = showPlayAgain ? <button className={classes.playAgainBtn} onClick={() => this.updateScore(this.state, this.state.winner)}><img src={refreshIcon} alt="play again icon"></img></button> : null;
        let score = 'Scores loading...';

        if (this.state.score) {
            score = (
                <div className={classes.scoreboard}>
                    <h2>Stats</h2>
                    <ul className={classes.scoreList}>
                        <li><strong>Games Played: </strong>{this.state.score.gamesPlayed}</li>
                        <li><strong>Player: </strong>{this.state.score.player} wins ({Number.parseFloat((this.state.score.player / this.state.score.gamesPlayed) * 100).toFixed(2)}%)</li>
                        <li><strong>Computer: </strong>{this.state.score.computer} wins ({Number.parseFloat((this.state.score.computer / this.state.score.gamesPlayed) * 100).toFixed(2)}%)</li>
                        <li><strong>Ties: </strong>{this.state.score.tie} ({Number.parseFloat((this.state.score.tie / this.state.score.gamesPlayed) * 100).toFixed(2)}%)</li>
                    </ul>
                </div>
            );
        }

        return (
            <div className={classes.wrapper}>
                <h1>{status}</h1>
                <table>
                    <tbody>
                        <tr>
                            <td>{this.renderSquare(0)}</td>
                            <td className={classes.vert}>{this.renderSquare(1)}</td>
                            <td>{this.renderSquare(2)}</td>
                        </tr>
                        <tr>
                            <td className={classes.hori}>{this.renderSquare(3)}</td>
                            <td className={[classes.vert, classes.hori].join(" ")}>{this.renderSquare(4)}</td>
                            <td className={classes.hori}>{this.renderSquare(5)}</td>
                        </tr>
                        <tr>
                            <td>{this.renderSquare(6)}</td>
                            <td className={classes.vert}>{this.renderSquare(7)}</td>
                            <td>{this.renderSquare(8)}</td>
                        </tr>
                    </tbody>
                </table>
                {playAgainBtn}
                {score}
            </div>
        )
    }
}

export default Board;