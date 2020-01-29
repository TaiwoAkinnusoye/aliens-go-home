import React from 'react';
import PropTypes from 'prop-types';

const Login = (props) => {
    const button = {
        x: -360,
        y: -600,
        width: 600,
        height: 30,
        style: {
            fill: 'transparent',
            cursor: 'pointer'
        },
        onClick: props.authenticate,
    };

    const text = {
        textAnchor: 'middle',
        x: 0,
        y: -440,
        style: {
            fontFamily: '"Joti One", cursive',
            fontSize: 45,
            fill: '#e3e3e3',
            cursor: 'pointer'
        },
        onClick: props.authenticate
    };

    return (
        <g filter="url(#shadow)">
            <rect {...button} />
            <text {...text}>
                Login to participate
            </text>
        </g>
    );
};

Login.propTypes = {
    authenticate: PropTypes.func.isRequired,
};

export default Login;