"use client"

import { useState } from "react"
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link as NextUILink,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Image,
} from "@nextui-org/react"
import { ChevronDown } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import UserRootState from "../../redux/rootstate/UserState"
import { axiosInstance } from "../../config/api/axiosInstance"
import { logout } from "../../redux/slices/UserSlice"
import { USER } from "../../utils/constants/constants"
import { showToastMessage } from "../../utils/helpers/toast"

const InkspireLogo = () => (
  <Image src="/images/login.jpg" alt="WriteSpace Logo" width={32} height={32} className="cursor-pointer rounded" />
)

export function InkSpireNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state: UserRootState) => state.user.userData)
  console.log(user,'usr in navbar');
  
  const isAuthenticated = useSelector((state: UserRootState) => state.user.isUserSignedIn)

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/logout")
      localStorage.removeItem("userToken")
      dispatch(logout())
      navigate(`${USER.LOGIN}`)
      showToastMessage("Logged out successfully", "success")
    } catch (error) {
      console.log("Logout Error", error)
      showToastMessage("Error during logout", "error")
    }
  }

  return (
    <Navbar 
      maxWidth="full" 
      className="bg-[#0000007b] h-14 px-4 fixed " 
      isMenuOpen={isMenuOpen} 
      onMenuOpenChange={setIsMenuOpen}
    >
      {isAuthenticated && (
        <NavbarContent className="sm:hidden" justify="start">
          <NavbarMenuToggle 
            aria-label={isMenuOpen ? "Close menu" : "Open menu"} 
            className="text-white" 
          />
        </NavbarContent>
      )}

      <NavbarBrand className="gap-2 h-full py-2">
        <InkspireLogo />
        <Link to={USER.HOME}>
          <p className="font-semibold text-red-700 text-lg">InkSpire</p>
        </Link>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        {isAuthenticated && (
          <>
            <NavbarItem>
              <NextUILink
                href={USER.HOME}
                className="text-white text-lg font-medium hover:text-gray-300 transition-colors"
              >
                Home
              </NextUILink>
            </NavbarItem>
            <Dropdown>
              <NavbarItem>
                <DropdownTrigger>
                  <Button
                    disableRipple
                    className="bg-transparent text-white text-lg font-medium p-0 data-[hover=true]:bg-transparent"
                    endContent={<ChevronDown className="w-4 h-4 ml-1" />}
                  >
                    Articles
                  </Button>
                </DropdownTrigger>
              </NavbarItem>
              <DropdownMenu aria-label="Article actions" className="bg-[#1a1a1a] text-white">
                <DropdownItem key="all-articles" onPress={() => navigate(USER.ALL_ARTICLE)}>
                  All Articles
                </DropdownItem>
                <DropdownItem key="my-articles" onPress={() => navigate(USER.ARTICLE)}>
                  My Articles
                </DropdownItem>
                <DropdownItem key="create-article" onPress={() => navigate(USER.CREATE_ARTICLE)}>
                  Create Article
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <NavbarItem>
              <NextUILink
                href={USER.ABOUT_US}
                className="text-white text-lg font-medium hover:text-gray-300 transition-colors"
              >
                About Us
              </NextUILink>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      <NavbarMenu className="bg-[#1a1a1a] pt-6">
        {isAuthenticated && (
          <>
            <NavbarMenuItem>
              <NextUILink
                href={USER.HOME}
                className="w-full text-white text-lg py-2 hover:text-gray-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </NextUILink>
            </NavbarMenuItem>
            <NavbarMenuItem className="flex flex-col gap-2">
              <NextUILink
                href={USER.ALL_ARTICLE}
                className="w-full text-white text-lg py-2 hover:text-gray-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                All Articles
              </NextUILink>
              <NextUILink
                href={USER.ARTICLE}
                className="w-full text-white text-lg py-2 hover:text-gray-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                My Articles
              </NextUILink>
              <NextUILink
                href={USER.CREATE_ARTICLE}
                className="w-full text-white text-lg py-2 hover:text-gray-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Create Article
              </NextUILink>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <NextUILink
                href={USER.ABOUT_US}
                className="w-full text-white text-lg py-2 hover:text-gray-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </NextUILink>
            </NavbarMenuItem>
          </>
        )}
      </NavbarMenu>

      <NavbarContent justify="end" className="gap-2">
        {isAuthenticated ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="default"
                name="User Name"
                size="sm"
                src={user?.profileImage || "/images/user.png"}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat" className="bg-[#1a1a1a] text-white">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">{user?.email}</p>
              </DropdownItem>
              <DropdownItem key="settings" onPress={() => navigate(USER.PROFILE)}>
                Profile
              </DropdownItem>
              <DropdownItem key="logout" className="text-red-500" onPress={handleLogout}>
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <>
            <NavbarItem>
              <Button
                onPress={() => navigate(USER.LOGIN)}
                className="border border-[#a28834] text-white font-medium min-w-[80px] h-9 rounded-lg border-solid"
              >
                Login
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button
                onPress={() => navigate(USER.SIGNUP)}
                className="border border-[#a28834] text-white font-medium min-w-[80px] h-9 rounded-lg border-solid"
                radius="sm"
              >
                Sign Up
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>
    </Navbar>
  )
}