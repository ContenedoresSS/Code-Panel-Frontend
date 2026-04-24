import axios from 'axios';

const api = axios.create({
    baseURL: 'https://codepanel.orchfr.duckdns.org/api/v1', 
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;