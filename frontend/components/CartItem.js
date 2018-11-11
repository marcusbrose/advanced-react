import styled from 'styled-components'
import formatMoney from '../lib/formatMoney'
import PropTypes from 'prop-types'
import RemoveFromCart from './RemoveFromCart'

const CartItemStyles = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme.lightgrey};
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;
  img {
    margin: 10px;
  }
  h3,
  p {
    margin: 0;
  }
`

const CartItem = ({ cartItem }) => {
  // if item was deleted in the meantime...
  if ( ! cartItem.item) {
    return <CartItemStyles>
      <p>This item has been removed</p>
      <RemoveFromCart id={cartItem.id} />
    </CartItemStyles>
  }
  return (
    <CartItemStyles>
      <img width={100} src={cartItem.item.image} alt={cartItem.item.title} />
      <div className="cart-item-description">
        <h3>{cartItem.item.title}</h3>
        <p>
          {formatMoney(cartItem.quantity*cartItem.item.price)}
          {' – '}
          <em>
            {cartItem.quantity} &times; {formatMoney(cartItem.item.price)} each
          </em>
        </p>
      </div>
      <RemoveFromCart id={cartItem.id} />
    </CartItemStyles>
  )
}

CartItem.propTypes = {
  cartItem: PropTypes.object.isRequired,
}

export default CartItem