import useShowToast from "../hooks/useShowToast";
import API from "./api";


export const useUpdatePic=()=>{
    const updateProfileImage=async(selectedFile,tokens)=>{
        const showToast = useShowToast()
        const file=selectedFile;
        const formDatas = new FormData();
        formDatas.append("profile_pictures", file);
        console.log(formDatas.get("profile_pictures"));
    
        // Upload the image
        const response=await API.patch("/api/v1/uploadFiles/upload-profile-pic", {
            headers: {
                Authorization: `Bearer ${tokens}`
            },
            body: formDatas,
        })
        if (!response.ok) {
            showToast("Error uploading profile picture",'','error')
            throw new Error('Failed to Update image');
        }
        const {data}=response
        console.log(data.fileId)
        return {pictureId:data.fileId}
    }
    return {updateProfileImage}

}