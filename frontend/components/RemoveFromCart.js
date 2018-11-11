import React from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { CURRENT_USER_QUERY } from './User'

const REMOVE_FROM_CART_MUTATION = gql`
  mutation REMOVE_FROM_CART_MUTATION($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`

const BigButton = styled.button`
  font-size: 3rem;
  background: none;
  border: 0;
  &:hover {
    color: ${props => props.theme.red};
    cursor: pointer;
  }
`

class RemoveFromCart extends React.Component {

  static propsTypes = {
    id: PropTypes.string.isRequired,
  }

  // this gets called right after mutation response
  update = (cache, payload) => {
    const data = cache.readQuery({ query: CURRENT_USER_QUERY })
    const cartItemId = payload.data.removeFromCart.id
    data.me.cart = data.me.cart.filter(cartItem => cartItem.id !== cartItemId)
    cache.writeQuery({ query: CURRENT_USER_QUERY, data })
  }

  render() {
    const { id } = this.props
    return <Mutation 
      mutation={REMOVE_FROM_CART_MUTATION} 
      variables={{ id }}
      // refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      update={this.update}
      optimisticResponse={{
        __typename: 'Mutation',
        removeFromCart: {
          __typename: 'CartItem',
          id: this.props.id,
        }
      }}
    >
      {(removeFromCart, { error, loading }) => (
        <BigButton 
        title="Delete Item"
          onClick={() => removeFromCart().catch(err => alert(err.message))}
          disabled={loading}
        >
          &times;
        </BigButton>
      )}
    </Mutation>
  }
}

export default RemoveFromCart