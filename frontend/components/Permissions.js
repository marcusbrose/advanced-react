import React from 'react'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import PropTypes from 'prop-types'
import Error from './ErrorMessage'
import Table from './styles/Table'
import SickButton from './styles/SickButton'

const possiblePermissions = ['ADMIN','USER','ITEMCREATE','ITEMUPDATE','ITEMDELETE','PERMISSIONUPDATE']

const ALL_USERS_QUERY = gql`
  query ALL_USERS_QUERY {
    users {
      id
      email
      name
      permissions
    }
  }
`

const UPDATE_PERMISSIONS_MUTATION = gql`
  mutation UPDATE_PERMISSIONS_MUTATION(
    $permissions: [Permission]!,
    $userId: ID!
  ) {
    updatePermissions(
      permissions: $permissions, 
      userId: $userId
    ) {
      id
      email
      name
      permissions
    }
  }
`

const Permissions = props => (
  <Query {...props} query={ALL_USERS_QUERY}>
    {({ data, loading, error }) => (
      <div>
        <Error error={error} />
        <h2>Manage Permissions</h2>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              {possiblePermissions.map(permission => (
                <th key={permission}>{permission}</th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.users.map(user => (
              <UserPermissions key={user.id} user={user} />
            ))}
          </tbody>
        </Table>
      </div>
    )}
  </Query>
)

class UserPermissions extends React.Component {

  static propTypes = {
    user: PropTypes.shape({
      id: PropTypes.string,
      email: PropTypes.string,
      name: PropTypes.string,
      permissions: PropTypes.array,
    }).isRequired,
  }

  state = {
    permissions: this.props.user.permissions
  }

  handlePermissionChange = (event, updatePermissions = null) => {
    const { value, checked } = event.target
    let permissions = [...this.state.permissions]
    if (checked) {
      permissions.push(value)
    } else {
      permissions = permissions.filter(permission => permission !== value)
    }
    this.setState({
      permissions,
    }, () => {
      if (updatePermissions) {
        updatePermissions()
      }
    })
  }

  render() {
    const { user } = this.props
    return (
      <Mutation 
        mutation={UPDATE_PERMISSIONS_MUTATION}
        variables={{
          permissions: this.state.permissions,
          userId: user.id
        }}
      >
        {(updatePermissions, { error, loading }) => (
          <>
          {error && <tr><td colspan={8}><Error error={error} /></td></tr>}
          <tr>
            <td>{user.name}</td>
            <td>{user.email}</td>
            {possiblePermissions.map(permission => (
              <td key={permission}>
                <label htmlFor={`${user.id}-permission-${permission}`}>
                  <input 
                    id={`${user.id}-permission-${permission}`}
                    type="checkbox"
                    checked={this.state.permissions.includes(permission)}
                    value={permission}
                    onChange={(event) => this.handlePermissionChange(event, updatePermissions)}
                  />
                </label>
              </td>
            ))}
            <td>
              <SickButton 
                type="button" 
                disabled={loading}
                onClick={updatePermissions}
              >
                Update
              </SickButton>
            </td>
          </tr>
          </>
        )}
      </Mutation>
    )
  }
}

export default Permissions
export { ALL_USERS_QUERY }