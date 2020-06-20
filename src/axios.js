import axios from 'axios';

// creating the axios instance that we can use globally
const instance = axios.create({
    baseURL: 'https://react-my-burger-4a08e.firebaseio.com/'
});

export default instance;