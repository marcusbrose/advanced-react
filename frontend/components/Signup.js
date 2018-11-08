import React from 'react'
import { Mutation } from 'react-apollo'
import Router from 'next/router'
import gql from 'graphql-tag'
import Form from './styles/Form'
import Error from './ErrorMessage'

const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION(
    $email: String!
    $name: String!
    $password: String!
  ) {
    signup(
      email: $email
      name: $name
      password: $password
    ) {
      id
    }
  }
`

class Signup extends React.Component {

  state = {
    email: '',
    name: '',
    password: '',
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value,
    })
  }

  render() {
    return (
      <Mutation mutation={SIGNUP_MUTATION} variables={this.state}>
        {(signup, { loading, error }) => (
          <Form method="POST" onSubmit={async (event) => {
            event.preventDefault()
            const response = await signup()
            this.setState({
              email: '',
              name: '',
              password: '',
            })
            Router.push({ pathname: '/me' })
          }}>
            <Error error={error} />
            <h2>Sign up for an account</h2>
            <fieldset disabled={loading} aria-busy={loading}>
              <label htmlFor="email">
                Email
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="email"
                  required
                  value={this.state.email}
                  onChange={this.handleChange} 
                />
              </label>
              <label htmlFor="name">
                Name
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="name"
                  required
                  value={this.state.name}
                  onChange={this.handleChange} 
                />
              </label>
              <label htmlFor="password">
                Password
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="password"
                  required
                  value={this.state.password}
                  onChange={this.handleChange} 
                />
              </label>
              <button type="submit">Signup</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

export default Signup