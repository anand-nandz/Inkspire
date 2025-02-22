import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserData, UserState } from '../../utils/interfaces/interfaces';


const initialState: UserState = {
    userData: null,
    isUserSignedIn: false,
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers:{
        setUserInfo:(state, action:PayloadAction<UserData>)=>{
            state.userData = action.payload;
            state.isUserSignedIn = true
        },
        logout:(state)=>{
            state.userData = null;
            state.isUserSignedIn = false
        },
    
    }
})


export const {setUserInfo,logout,  } = userSlice.actions;
export default userSlice.reducer