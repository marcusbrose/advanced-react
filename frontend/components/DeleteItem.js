import React from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import { ALL_ITEMS_QUERY } from './Items'

const DELETE_ITEM_MUTATION = gql`
  mutation DELETE_ITEM_MUTATION($id: ID!) {
    deleteItem(id: $id) {
      id
    }
  }
`

class DeleteItem extends React.Component {

  update = (cache, payload) => {
    // manually update the client cache
    // 1. read the cache
    const data = cache.readQuery({ query: ALL_ITEMS_QUERY })
    console.log(data)
    // 2. filter delete item out
    const items = data.items.filter(item => item.id !== payload.data.deleteItem.id)
    // 3. update the cache
    cache.writeQuery({ query: ALL_ITEMS_QUERY, data: { items } })
    console.log(cache.readQuery({ query: ALL_ITEMS_QUERY }))
  }

  render() {
    return (
      <Mutation 
        mutation={DELETE_ITEM_MUTATION} 
        variables={{ id: this.props.id }}
        update={this.update}
      >
      {(deleteItem, { error, }) => (
        <button onClick={() => { if (confirm('Sure?')) { deleteItem() }}}>
          {this.props.children}
        </button>
      )}
      </Mutation>
    )
  }
}

export default DeleteItem