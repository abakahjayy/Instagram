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
} from "@chakra-ui/react";
import useAuthStore from "../../store/useAuthStore";
import { useRef, useState } from "react";
import useShowToast from "../../hooks/useShowToast";
import { ProfileUrl } from "../../utils/imageUrl";
import usePreviewImg from "../../hooks/usePreviewing";
import useEditProfile from "../../hooks/useEditProfile";
const tokens = JSON.parse(localStorage.getItem("user-info"))?.token;

const EditProfile = ({ isOpen, onClose}) => {
	const {editProfile, isUpdating }=useEditProfile()
	// console.log(tokens)
	const authUser = useAuthStore((state) => state.user);
	const user=authUser.user?authUser.user:authUser
	const username=user.username
	const url =user.profile_picture_id?ProfileUrl(user.profile_picture_id):'';
	const fileRef = useRef(null);
	const {selectedFile, handleImageChange,formDatas, setSelectedFile }=usePreviewImg()
	const showToast = useShowToast();

	// console.log(selectedFile)
	const [inputs, setInputs] = useState({
		firstName: "",
		lastName: "",
		username: "",
		bio: "",
	});
	const handleEditProfile = async () => {
		try {
			await editProfile(inputs, selectedFile,formDatas,username,tokens);
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
											{!selectedFile&&<Avatar size='xl'src={url} border={"2px solid white "} />}
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
