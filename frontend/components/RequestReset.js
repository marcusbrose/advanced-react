import React from 'react'
import { Mutation } from 'react-apollo'
import Router from 'next/router'
import gql from 'graphql-tag'
import Form from './styles/Form'
import Error from './ErrorMessage'

const REQUEST_RESET_MUTATION = gql`
  mutation REQUEST_RESET_MUTATION(
    $email: String!
  ) {
    requestReset(
      email: $email
    ) {
      message
    }
  }
`

class RequestReset extends React.Component {

  state = {
    email: 'contact@marcusbrose.com',
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value,
    })
  }

  render() {
    return (
      <Mutation 
        mutation={REQUEST_RESET_MUTATION} 
        variables={this.state}
      >
        {(requestReset, { loading, error, called }) => (
          <Form method="POST" onSubmit={async (event) => {
            event.preventDefault()
            const response = await requestReset()
            this.setState({
              email: '',
            })
            // Router.push({ pathname: '/me' })
          }}>
            <h2>Request a password reset</h2>
            <Error error={error} />
            {!error && !loading && called && <p>Success! Check your email for a reset link.</p>}
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
              <button type="submit">Request Reset</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

export default RequestReset