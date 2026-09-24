import {
	Avatar,
	Button,
	Center,
	Flex,
	FormControl,
	FormLabel,
	Heading,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Stack,
	Box,
	Switch,
	Text,
} from "@chakra-ui/react";
import useAuthStore from "../../store/useAuthStore";
import { useRef, useState } from "react";
import useShowToast from "../../hooks/useShowToast";
import { avatarUrl } from "../../utils/media";
import usePreviewImg from "../../hooks/usePreviewing";
import useEditProfile from "../../hooks/useEditProfile";
import API from "../../utils/api";
import { getAuthToken } from "../../utils/auth";

const EditProfile = ({ isOpen, onClose}) => {
	const {editProfile, isUpdating }=useEditProfile()
	// console.log(tokens)
	const authUser = useAuthStore((state) => state.user);
	const user=authUser.user?authUser.user:authUser
	const username=user.username
	const url = avatarUrl(user);
	const fileRef = useRef(null);
	const {selectedFile, handleImageChange,formDatas, setSelectedFile }=usePreviewImg()
	const showToast = useShowToast();
	const setAuthUser = useAuthStore((state) => state.setAuthUser);
	const [savingEmailPref, setSavingEmailPref] = useState(false);
	const emailOn = user.emailNotifications !== false;

	// Saves straight away, like Instagram's settings toggles.
	const toggleEmails = async (on) => {
		setSavingEmailPref(true);
		try {
			await API.patch("/api/v1/instagram/settings/email", { emailNotifications: on }, { headers: { Authorization: `Bearer ${getAuthToken()}` } });
			setAuthUser({ ...user, emailNotifications: on });
			showToast(on ? "Emails on" : "Emails off", on ? "We'll email you about followers, comments, messages and updates." : "You won't get emails from us.", "success", 2000);
		} catch (error) {
			showToast("Error", error.response?.data?.error || error.message, "error");
		} finally {
			setSavingEmailPref(false);
		}
	};

	// console.log(selectedFile)
	const [inputs, setInputs] = useState({
		firstName: "",
		lastName: "",
		username: "",
		bio: "",
	});
	const handleEditProfile = async () => {
		try {
			// read the token now - a module-level read went stale after logging in
			await editProfile(inputs, selectedFile,formDatas,username,getAuthToken());
			setSelectedFile(null);
			onClose();
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};
	return (
		<>
			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent bg={"black"} boxShadow={"xl"} border={"1px solid gray"} mx={3}>
					<ModalHeader />
					<ModalCloseButton />
					<ModalBody>
						{/* Container Flex */}
						<Flex bg={"black"}>
							<Stack spacing={4} w={"full"} maxW={"md"} bg={"black"} p={6} my={0}>
								<Heading lineHeight={1.1} fontSize={{ base: "2xl", sm: "3xl" }}>
									Edit Profile
								</Heading>
								<FormControl>
									<Stack direction={["column", "row"]} spacing={6}>
										<Center>
											{selectedFile&&<Avatar size='xl' src={selectedFile} border={"2px solid white "} />}
											{!selectedFile&&<Avatar size='xl' src={url} name={user.username} referrerPolicy='no-referrer' border={"2px solid white "} />}
										</Center>
										<Center w='full'>
											<Button w='full' onClick={() => fileRef.current.click()}>
												Edit Profile Picture
											</Button>
										</Center>
										<Input type='file' hidden ref={fileRef} onChange={handleImageChange} />
									</Stack>
								</FormControl>

								<FormControl>
									<FormLabel fontSize={"sm"}>First Name</FormLabel>
									<Input placeholder={"First Name"} size={"sm"} type={"text"}
										value={inputs.firstName || authUser.firstName}
										onChange={(e) => setInputs({ ...inputs, firstName: e.target.value })}
									/>
								</FormControl>

								<FormControl>
									<FormLabel fontSize={"sm"}>Last Name</FormLabel>
									<Input placeholder={"Last Name"} size={"sm"} type={"text"}
										value={inputs.lastName || authUser.lastName}
										onChange={(e) => setInputs({ ...inputs, lastName: e.target.value })}
									/>
								</FormControl>

								<FormControl>
									<FormLabel fontSize={"sm"}>Username</FormLabel>
									<Input
										placeholder={"Username"}
										size={"sm"}
										type={"text"}
										value={inputs.username || authUser.username}
										onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
									/>
								</FormControl>

								<FormControl>
									<FormLabel fontSize={"sm"}>Bio</FormLabel>
									<Input placeholder={"Bio"}
										size={"sm"}
										type={"text"}
										value={inputs.bio || authUser.bio}
										onChange={(e) => setInputs({ ...inputs, bio: e.target.value })}
									/>
								</FormControl>

								<FormControl display='flex' alignItems='center' justifyContent='space-between' gap={4}>
									<Box>
										<FormLabel htmlFor='email-notifications' fontSize={"sm"} mb={0}>Email notifications</FormLabel>
										<Text fontSize='xs' color='gray.500'>New followers, comments, messages while you&apos;re away, and app updates</Text>
									</Box>
									<Switch id='email-notifications' colorScheme='blue' isChecked={emailOn} isDisabled={savingEmailPref} onChange={(e) => toggleEmails(e.target.checked)} />
								</FormControl>

								<Stack spacing={6} direction={["column", "row"]}>
									<Button
										bg={"red.400"}
										color={"white"}
										w='full'
										size='sm'
										_hover={{ bg: "red.500" }}
										onClick={onClose}
									>
										Cancel
									</Button>
									<Button
										bg={"blue.400"}
										color={"white"}
										size='sm'
										w='full'
										_hover={{ bg: "blue.500" }}
										onClick={handleEditProfile}
										isLoading={isUpdating}
									>
										Submit
									</Button>
								</Stack>
							</Stack>
						</Flex>
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
};

export default EditProfile;
