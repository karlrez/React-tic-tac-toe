import React, { Component } from 'react';

import Backdrop from '../Backdrop/Backdrop';
import Aux from '../Auxiliary/Auxiliary';
import classes from './Modal.Module.css';

class Modal extends Component {
    render() {
        return (
            <Aux>
                <Backdrop 
                    show={this.props.show} />
                <div
                    className={classes.Modal}
                    style={{
                        transform: this.props.show ? 'translateY(0)' : 'translateY(-100vh)',
                        opacity: this.props.show ? '1' : '0'
                    }}>
                    {this.props.status}
                </div>
            </Aux>
        )
    }
}

export default Modal;