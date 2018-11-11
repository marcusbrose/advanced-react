import { default as PermissionsList} from '../components/Permissions'
import PleaseSignin from '../components/PleaseSignin'

const Permissions = props => (
  <div>
    <PleaseSignin>
      <PermissionsList />
    </PleaseSignin>
  </div>
)

export default Permissions