import axios from 'axios';
import { setAlert } from './alert';
import {
	REGISTER_FAIL,
	CLEAR_PROFILE,
	REGISTER_SUCCESS,
	USER_LOADED,
	LOGOUT,
	AUTH_ERROR,
	LOGIN_FAIL,
	LOGIN_SUCCESS
} from './types';
import setAuthToken from '../utils/setAuthToken';

//load user
export const loadUser = () => async (dispatch) => {
	if (localStorage.token) {
		setAuthToken(localStorage.token);
	}

	try {
		const res = await axios.get('api/auth');
		dispatch({
			type: USER_LOADED,
			payload: res.data
		});
	} catch (error) {
		dispatch({
			type: AUTH_ERROR
		});
	}
};

//register user
export const register = ({ name, email, password }) => async (dispatch) => {
	const config = {
		headers: {
			'Content-Type': 'application/json'
		}
	};

	const body = JSON.stringify({ name, email, password });
	try {
		const res = await axios.post('/api/users', body, config);

		dispatch({
			type: REGISTER_SUCCESS,
			payload: res.data
		});
		dispatch(loadUser());
	} catch (error) {
		const errors = error.response.data.errors;

		if (errors) {
			errors.forEach((error) => dispatch(setAlert(Error.msg, 'danger')));
		}

		dispatch({
			type: REGISTER_FAIL
		});
	}
};

//login user
export const login = (email, password) => async (dispatch) => {
	const config = {
		headers: {
			'Content-Type': 'application/json'
		}
	};

	const body = JSON.stringify({ email, password });
	try {
		const res = await axios.post('/api/auth', body, config);

		dispatch({
			type: LOGIN_SUCCESS,
			payload: res.data
		});
		dispatch(loadUser());
	} catch (error) {
		const errors = error.response.data.errors;

		if (errors) {
			errors.forEach((error) => dispatch(setAlert(Error.msg, 'danger')));
		}

		dispatch({
			type: LOGIN_FAIL
		});
	}
};

//logout / clear profile
export const logout = () => (dispatch) => {
	dispatch({ type: LOGOUT });
	dispatch({ type: CLEAR_PROFILE });
};
