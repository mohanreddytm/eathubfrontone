import { IoPersonSharp } from "react-icons/io5";
import appLogo from '../../../images/eathublogo.png'
import Footer from "../Footer";
import MainBack from "../../HomePage/RegisterMainRoute/style";

import './index.css'

const Profile = () => {

    const loginCustomer = () => {
        return(
            <MainBack image={appLogo} className="login-required-cont-cus">
                <h1>Login For EatHub</h1>
                <button>Login</button>
            </MainBack>
        )
    }
    return(
        <div>
            {loginCustomer()}
            <Footer />
        </div>
    )

}

export default Profile;