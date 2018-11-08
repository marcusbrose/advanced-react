import React from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import Router from 'next/router'
import gql from 'graphql-tag'
import Form from './styles/Form'
import Error from './ErrorMessage'
import { CURRENT_USER_QUERY } from './User'

const RESET_PASSWORD_MUTATION = gql`
  mutation RESET_PASSWORD_MUTATION(
    $resetToken: String!,
    $password: String!,
    $confirmPassword: String!
  ) {
    resetPassword(
      resetToken: $resetToken
      password: $password
      confirmPassword: $confirmPassword
    ) {
      id
      name
    }
  }
`

class ResetPassword extends React.Component {

  static propTypes = {
    resetToken: PropTypes.string.isRequired,
  }

  state = {
    password: '',
    confirmPassword: '',
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value,
    })
  }

  render() {
    return (
      <Mutation 
        mutation={RESET_PASSWORD_MUTATION} 
        variables={{
          resetToken: this.props.resetToken,
          ...this.state
        }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(resetPassword, { loading, error, called }) => (
          <Form method="POST" onSubmit={async (event) => {
            event.preventDefault()
            console.log(this.props.resetToken)
            const response = await resetPassword()
            this.setState({
              password: '',
              confirmPassword: '',
            })
            Router.push({ pathname: '/me' })
          }}>
            <h2>Reset your password {this.props.resetToken}</h2>
            <Error error={error} />
            <fieldset disabled={loading} aria-busy={loading}>
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
              <label htmlFor="confirmPassword">
                Confirm Password
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="confirmPassword"
                  required
                  value={this.state.confirmPassword}
                  onChange={this.handleChange} 
                />
              </label>
              <button type="submit">Reset password</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

export default ResetPassword