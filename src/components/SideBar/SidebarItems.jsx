import CreatePost from "./CreatePost";
import Home from "./Home";
import Notifications from "./Notifications";
import ProfileLink from "./ProfileLink";
import Search from "./Search";
import Messages from './MessagesLink'
import ReelsLink from './ReelsLink'

// Same order as instagram.com's left rail (2026).
const SidebarItems = ({authUser,onLogout}) => {
	return (
		<>
			<Home authUser={authUser} onLogout={onLogout} />
			<ReelsLink />
			<Messages authUser={authUser} onLogout={onLogout}/>
			<Search authUser={authUser} onLogout={onLogout}/>
			<Notifications authUser={authUser} onLogout={onLogout}/>
			<CreatePost authUser={authUser} onLogout={onLogout}/>
			<ProfileLink authUser={authUser} onLogout={onLogout} />
		</>
	);
};

export default SidebarItems;
