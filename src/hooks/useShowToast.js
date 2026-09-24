import { useToast } from "@chakra-ui/react";
import { useCallback } from "react";

const useShowToast = () => {
	const toast = useToast();

	// useCallback is used to prevent infinite loop, by  caching the function
	const showToast = useCallback(
		(title, description, status,time) => {
			toast({
				title: title,
				description: description,
				status: status,
				duration: time||3000,
				isClosable: true,
			});
		},
		[toast]
	);

	return showToast;
};

export default useShowToast;
