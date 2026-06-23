import React from 'react'
import useUserStore from '../../store/useUserStore';
import useLayoutStore from '../../store/layoutStore';
import {useLocation,useNavigate} from 'react-router-dom';
import useThemeStore from '../../store/themeStore';
import Sidebar from './Sidebar';
import { AnimatePresence } from 'framer-motion';
import ChatWindow from '../pages/chatSection/ChatWindow';

function Layout({children,isThemeDialogOpen,toggleThemeDialog,isStatusPreviewOpen,statusPreviewContent}) {
    const selectedContact = useLayoutStore(state => state.selectedContact);
    const setSelectedContact = useLayoutStore(state => state.setSelectedContact);
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobile,setIsMobile] = useState(window.innerWidth <=768)
    const {theme,setTheme} = useThemeStore();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <=768)
        }
        window.addEventListener('resize',handleResize)
        return () => {
            window.removeEventListener('resize',handleResize)
        }
    },[])

    
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#111b21] text-white':'bg-gray-100 text-black'}flex relative`}>
        {!isMobile && <Sidebar/>}
        <div className={`flex-1 flex overflow-hidden ${isMobile ? "flex-col":"flex-row"}`}>
            <AnimatePresence initial={false}>
                {(!selectedContact || !isMobile) && (
                    <MotionConfig.div
                    key="chatlist"
                    initial={{ x:isMobile ? "-100%":0 }}
                    animate={{x:0}}
                    exit={{x:"-100%"}}
                    transition={{type:"tween"}}
                    className={`w-full md:w-2/5 h-full ${isMobile ? "pb-16":""}`}
                    >
                        {children}

                    </MotionConfig.div>
                )}
                {(!selectedContact || !isMobile) && (
                    <MotionConfig.div
                    key="chatWindow"
                    initial={{ x:isMobile ? "-100%":0 }}
                    animate={{x:0}}
                    exit={{x:"-100%"}}
                    transition={{type:"tween"}}
                    className="w-full h-full"
                    >
                        <ChatWindow selectedContact={selectedContact} 
                        setSelectedContact={setSelectedContact}
                        isMobile={isMobile}
                        />

                    </MotionConfig.div>
                )}
            </AnimatePresence>

        </div>
        {isMobile && <Sidebar/>}
        {isThemeDialogOpen && (
            <div className="z-50">

            </div>
        )}
    </div>
  )
}

export default Layout