import { Link } from "@nextui-org/link"
import { Divider } from "@nextui-org/divider"
import { Youtube, Phone, Instagram, Linkedin } from 'lucide-react'
import { USER } from "../../utils/constants/constants"

export default function Footer() {
  return (
    <footer className="bg-[#000000db] text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo */}
          <div className="text-xl font-bold">
            InkSpire
          </div>

          {/* Navigation */}
          <div className="flex gap-6">
            <Link href={USER.ABOUT_US} className="text-white hover:text-gray-300">
              About
            </Link>
            <Link href="/home" className="text-white hover:text-gray-300">
              Articles
            </Link>
           
            <Link href="/home" className="text-white hover:text-gray-300">
              Support
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link href={`https://www.linkedin.com/in/anand-pr-07b166217/`} className="text-white hover:text-gray-300">
              <Linkedin size={20} />
              <span className="sr-only">LinkedIn</span>
            </Link>
            <Link href={`https://www.instagram.com/anand_nandzz?igsh=M2x6MDZtM3JhbW9j`} className="text-white hover:text-gray-300">
              <Instagram size={20} />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link href="#" className="text-white hover:text-gray-300">
              <Youtube size={20} />
              <span className="sr-only">Youtube</span>
            </Link>
            <Link href="#" className="text-white hover:text-gray-300">
              <Phone size={20} />
              <span className="sr-only">Phone</span>
            </Link>
          </div>
        </div>

        <Divider className="my-4 bg-gray-700" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-gray-400">
          <p>© 2025  All right reserved.</p>
          <p>Support: writespace.connect@gmail.com</p>
        </div>
      </div>
    </footer>
  )
}

