import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const Register = (props) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();
  const { player, setPlayer } = props;

  const handleLoginAfterRegister = (email, password) => {
    axios
      .post('http://localhost:8000/api/player/login', { email, password })
      .then((res) => {
        setPlayer(res.data);
        Cookies.set('player', JSON.stringify(res.data), { expires: 7 });
        navigate('/play');
      })
      .catch((err) => {
        console.log('Login Error:', err);
      });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords must match' });
      return;
    }

    const newPlayer = {
      firstName: `${firstName.charAt(0).toUpperCase()}${firstName.slice(1)}`,
      lastName: `${lastName.charAt(0).toUpperCase()}${lastName.slice(1)}`,
      email: email,
      password: password,
      confirmPassword: confirmPassword,
    };

    axios
      .post('http://localhost:8000/api/player/register', newPlayer)
      .then((res) => {
        setErrors({});
        setPlayer(newPlayer);
        navigate('/play');
        Cookies.set('newPlayer', JSON.stringify(res.data), { expires: 30 });

        handleLoginAfterRegister(email, password);
      })
      .catch((err) => {
        if (err.response && err.response.data && err.response.data.errors) {
          const errorMessages = Object.values(err.response.data.errors).map((error) => error.message);
          setErrors({ ...errorMessages });
        }
      });
  };

  return (
    <div className="login-container">
      <h2>Register for Dojo Poker</h2>
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <p className='text-danger'>
          {errors && Object.values(errors).map((error, index) => (
            <span key={index}>{error}<br /></span>
          ))}
        </p>
        <button type="submit" className="btn btn-primary">
          Register
        </button>
      </form>
      <p>
        Already have an account? <Link to="/">Login here</Link>.
      </p>
    </div>
  );
};

export default Register;
