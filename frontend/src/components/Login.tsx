import React, { SyntheticEvent, useState } from "react"
import axios from 'axios';
import { Navigate } from "react-router-dom";

type LoginResponse = {
    token: string;
};

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [redirect, setRedirect] = useState(false);


    const submit = async (e: SyntheticEvent) => {
        e.preventDefault();

        const {data} = await axios.post<LoginResponse>('login', {
            email,
            password,
        }, {withCredentials: true});

        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

        setRedirect(true);
    }

    if (redirect){
        return <Navigate to='/'/>
    }

    return <main className="form-signin w-100 m-auto">
    <form onSubmit={submit}>
      <h1 className="h3 mb-3 fw-normal">Please sign in</h1>
      <div className="form-floating">
        <input type="email" className="form-control" id="floatingInput" placeholder="name@example.com"
            onChange={e => setEmail(e.target.value)}
        />
        <label htmlFor="floatingInput">Email address</label>
      </div>
      <div className="form-floating">
        <input type="password" className="form-control" id="floatingPassword" placeholder="Password"
            onChange={e => setPassword(e.target.value)}
        />
        <label htmlFor="floatingPassword">Password</label>
      </div>


      <button className="btn btn-primary w-100 py-2" type="submit">Submit</button>
    </form>
  </main>
}