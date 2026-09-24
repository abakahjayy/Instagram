import { Avatar, Button, Flex,Text } from "@chakra-ui/react";
import useAuthStore from "../../store/useAuthStore";
import { Link } from "react-router-dom";
import { ProfileUrl } from "../../utils/imageUrl";

export default function SuggestedHeader({user,onLogout}) {
        // const url =user.profile_picture_id?ProfileUrl(user.profile_picture_id):'';
        // console.log(user)
        const apiUrl = import.meta.env.VITE_API_URL
        const {isLoading} = useAuthStore()
        return (
            <Flex justifyContent={'space-between'} alignItems={'center'} w={'full'}>
                <Flex alignItems={'center'} gap={2}>
                    <Link to={`${user.username}`}>
                        <Avatar src={`${apiUrl}/api/v1/posts/image/${user.profile_picture_id}`} size={'lg'}/>
                    </Link>
                    <Text fontSize={13} fontWeight={'bold'}>
                        {user.username}
                    </Text>
                </Flex>
                <Button
                bg={'transparent'}
                size={'xs'}
                fontSize={14}
                fontWeight={'medium'} color={'blue.400'} cursor={'pointer'}
                _hover={{color:'white'}}
                isLoading={isLoading}
                onClick={()=>{
                    onLogout(user._id);
                }}>
                    Log out
                </Button>
            </Flex>
        )
}
