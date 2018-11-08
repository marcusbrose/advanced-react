import { default as SignupForm } from '../components/Signup'
import { default as SigninForm } from '../components/Signin'
import { default as RequestResetForm } from '../components/RequestReset'
import styled from 'styled-components'

const Colums = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
`

const Signup = props => (
  <Colums>
    <SignupForm />
    <SigninForm />
    <RequestResetForm />
  </Colums>
)

export default Signup