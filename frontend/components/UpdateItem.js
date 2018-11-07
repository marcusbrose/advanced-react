import React from 'react'
import { Mutation, Query } from 'react-apollo'
import Router from 'next/router'
import gql from 'graphql-tag'
import Form from './styles/Form'
import Error from './ErrorMessage'
import formatMoney from '../lib/formatMoney'

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      price
      image
    }
  }
`

const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION(
    $id: ID!
    $title: String
    $description: String
    $price: Int
    $image: String
    $largeImage: String
  ) {
    updateItem(
      id: $id
      title: $title
      description: $description
      price: $price
      image: $image
      largeImage: $largeImage
    ) {
      id
    }
  }
`

class UpdateItem extends React.Component {

  state = {}

  handleChange = event => {
    const { name, type, value } = event.target
    const val = type === 'number'
      ? parseFloat(value)
      : value
    this.setState({
      [name]: event.target.value,
    })
  }

  uploadFile = async (event) => {
    const files = event.target.files
    const data = new FormData()
    data.append('file', files[0])
    data.append('upload_preset', 'sickfits')
    const response = await fetch('https://api.cloudinary.com/v1_1/marcusbrose/image/upload', {
      method: 'POST',
      body: data
    })
    const file = await response.json()
    this.setState({
      image: file.secure_url,
      largeImage: file.eager[0].secure_url,
    })
  }

  updateItem = async (event, updateItemMutation) => {
    event.preventDefault()
    const response = await updateItemMutation({
      variables: {
        id: this.props.id,
        ...this.state,
      }
    })
  }

  render() {
    return (
      <Query query={SINGLE_ITEM_QUERY} variables={{ id: this.props.id }}>
      {({ data, loading }) => {
        if (loading) return <p>Loading...</p>
        if ( ! data.item) return <p>No item found for ID {this.props.id}!</p>
        return (
          <Mutation mutation={UPDATE_ITEM_MUTATION} variables={data.item}>
            {(updateItem, { loading, error }) => (
              <Form onSubmit={e => this.updateItem(e, updateItem)}>
                <Error error={error} />
                <h2>Sell an item.</h2>
                <fieldset disabled={loading} aria-busy={loading}>
                  <label htmlFor="file">
                    Image
                    <input
                      type="file"
                      id="file"
                      name="file"
                      placeholder="Upload an image"
                      onChange={this.uploadFile} 
                    />
                    {data.item.image && <img src={data.item.image} width={200} />}
                  </label>
                  <label htmlFor="title">
                    Title
                    <input
                      type="text"
                      id="title"
                      name="title"
                      placeholder="Title"
                      required
                      defaultValue={data.item.title}
                      onChange={this.handleChange} 
                    />
                  </label>
                  <label htmlFor="price">
                    Price
                    <input
                      type="number"
                      id="price"
                      name="price"
                      placeholder="price"
                      required
                      defaultValue={data.item.price}
                      onChange={this.handleChange} 
                    />
                  </label>
                  <label htmlFor="description">
                    Description
                    <textarea
                      id="description"
                      name="description"
                      placeholder="Enter a description"
                      required
                      defaultValue={data.item.description}
                      onChange={this.handleChange} 
                    />
                  </label>
                  <button type="submit">Save changes</button>
                </fieldset>
              </Form>
            )}
          </Mutation>
        )}}
      </Query>
    )
  }
}

export default UpdateItem
export { UPDATE_ITEM_MUTATION }