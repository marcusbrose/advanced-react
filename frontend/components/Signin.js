import React from 'react'
import { Mutation } from 'react-apollo'
import Router from 'next/router'
import gql from 'graphql-tag'
import Form from './styles/Form'
import Error from './ErrorMessage'
import { CURRENT_USER_QUERY } from './User'

const SIGNIN_MUTATION = gql`
  mutation SIGNIN_MUTATION(
    $email: String!
    $password: String!
  ) {
    signin(
      email: $email
      password: $password
    ) {
      id
    }
  }
`

class Signin extends React.Component {

  state = {
    email: 'contact@marcusbrose.com',
    password: 'test123',
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value,
    })
  }

  render() {
    return (
      <Mutation 
        mutation={SIGNIN_MUTATION} 
        variables={this.state}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(signin, { loading, error }) => (
          <Form method="POST" onSubmit={async (event) => {
            event.preventDefault()
            const response = await signin()
            this.setState({
              email: '',
              password: '',
            })
            Router.push({ pathname: '/me' })
          }}>
            <Error error={error} />
            <h2>Sign in</h2>
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
              <button type="submit">Signin</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

export default Signin