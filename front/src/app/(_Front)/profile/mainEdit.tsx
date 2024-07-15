import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import styled, { keyframes, css } from "styled-components";
import axios from "axios";
import AxiosUrl from "@/app/axios/url";

// useFileState 훅과 초기 데이터
export const useFileState = (onUpload: (data: any) => void) => {
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    profileBannerImgName: null,
    profileImgName: null,
    mainSongAlbumImage: null,
    albumImage: null,
  });

  interface profileInfoProps {
    profileBannerImgName: string;
    profileImgName: string;
    nickname: string;
    followingCount: number;
    followersCount: number;
    intro: string;
  }

  const [profileInfo, setProfileInfo] = useState<profileInfoProps>({
    profileBannerImgName: "",
    profileImgName: "",
    nickname: "닉네임",
    followingCount: 0,
    followersCount: 0,
    intro: "자기소개를 입력하세요",
  });

  const [albumInfo, setAlbumInfo] = useState({
    mainSongAlbumImage: "",
    albumImage: "",
    songTitle: "곡 명",
    albumTitle: "앨범제목",
    genre: "장르",
    lyricist: "작사가",
    composer: "작곡가",
    likeCount: 0,
  });

  const authToken =
    "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ1c2VyQG5hdmVyLmNvbSIsImF1dGgiOiJST0xFX1VTRVIiLCJleHAiOjE3MjQ2MDczMzh9.BbvfPZE8fzZNQNJdyq0XQz7GaIUYhhLUhoup35KwlfC-92MHXOi3jkILH19lFdDVQkuwtFWRlyRbVZQW8a8QUA";

  const handleBannerSubmit = async (
    e: ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    // 파일이 선택되었는지 확인
    if (e.target.files && e.target.files.length > 0) {
      // 선택된 파일
      const file = e.target.files[0];
      console.log(file);

      // FormData에 파일 추가
      const BannernewFiles = { ...files, [key]: file };
      setFiles(BannernewFiles);

      // key를 통해 FormData에 파일 추가
      const formData = new FormData();
      formData.append("bannerImg", file);
      console.log(formData);

      // 프로필 배너 이미지 업로드
      try {
        const res = await axios.post(
          `${AxiosUrl}/users/set-profile-bannerImage`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        console.log(res.data);
        onUpload({ [key]: res.data }); // 업로드 성공 시 데이터 처리
        window.location.reload(); // 페이지 새로고침 (필요에 따라 변경)
      } catch (error) {
        console.error("배너 이미지 업로드 실패:", error);
      }
    } else {
      console.error("업로드 파일이 존재하지 않음");
    }
  };

  // 프로필 이미지 데이터
  const handleProfileSubmit = async (
    e: ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    // 파일이 선택되었는지 확인
    if (e.target.files && e.target.files.length > 0) {
      // 선택된 파일
      const file = e.target.files[0];
      console.log(file);

      // FormData에 파일 추가
      const profileFormData = new FormData();
      profileFormData.append("profileImg", file);

      try {
        // 프로필 이미지 업로드
        const res = await axios.post(
          `${AxiosUrl}/users/set-profile`,
          profileFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        console.log(res.data);
        onUpload({ [key]: res.data }); // 업로드 성공 시 데이터 처리
        window.location.reload(); // 페이지 새로고침 (필요에 따라 변경)
      } catch (error) {
        console.error("프로필 이미지 업로드 실패:", error);
      }
    } else {
      console.error("업로드 파일이 존재하지 않음");
    }
  };

  // 프로필 수정 데이터
  const handleProfileEditSubmit = async () => {
    const profileEditData = {
      nickname: profileInfo.nickname,
      intro: profileInfo.intro,
    };

    try {
      const profileEdit = await axios.put(
        `${AxiosUrl}/users/set-profile-nickname-intro`,
        profileEditData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (profileEdit.status === 200 && profileEdit.data.success) {
        console.log("프로필 닉네임 및 소개 업로드 성공:", profileEdit.data);
        onUpload({
          nickname: profileEdit.data.nickname,
          intro: profileEdit.data.intro,
        });
      } else {
        console.error("프로필 닉네임 및 소개 업로드 실패:", profileEdit.data);
      }
    } catch (error) {
      console.error("프로필 닉네임 및 소개 업로드 실패:", error);
    }
  };

  // 메인 Get 통신 데이터
  const [userId, setUserId] = useState(2); // 초기 userId 값을 설정합니다.

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`${AxiosUrl}/profile`, {
          params: { userId },
        });
        const data = response.data;
        console.log("프로필 데이터 가져옴:", data);

        setProfileInfo(data);
        setAlbumInfo(data);
      } catch (error) {
        console.error("프로필 데이터를 가져오는데 실패했습니다.", error);
      }
    };

    fetchProfileData();
  }, [userId]); // userId가 변경될 때마다 useEffect가 실행됩니다.

  // 프로필 정보 변경 핸들러
  const handleProfileInfoChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    // 이름과 소개글 길이 제한
    if (name === "nickname" && value.length > 10) {
      alert("이름은 최대 10글자까지 입력할 수 있습니다.");
      return;
    }
    if (name === "intro" && value.length > 70) {
      alert("자기소개는 최대 70글자까지 입력할 수 있습니다.");
      return;
    }
    setProfileInfo((prevInfo) => ({ ...prevInfo, [name]: value }));
  };

  return {
    files,
    profileInfo,
    albumInfo,
    setProfileInfo,
    handleBannerSubmit,
    handleProfileInfoChange,
    handleProfileSubmit,
    handleProfileEditSubmit,
  };
};

// 배너 데이터 컴포넌트
const BannerData: React.FC<{ onUpload: (data: any) => void }> = ({
  onUpload,
}) => {
  const { handleBannerSubmit } = useFileState(onUpload);

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    await handleBannerSubmit(e, "profileBannerImgName");
  };

  return (
    <UploadForm>
      <Label>
        <HiddenInput
          type="file"
          onChange={handleFileInputChange}
          id="profileBannerImgName"
        />
        <CustomButton htmlFor="profileBannerImgName">⚙️</CustomButton>
      </Label>
    </UploadForm>
  );
};

// 프로필 데이터 컴포넌트
const ProfileData: React.FC<{ onUpload: (data: any) => void }> = ({
  onUpload,
}) => {
  const { handleProfileSubmit, profileInfo, setProfileInfo } =
    useFileState(onUpload);

  const [isEditVisible, setEditVisible] = useState(false);

  const handleEditSubmit = async (e: ChangeEvent<HTMLInputElement>) => {
    await handleProfileSubmit(e, "profileImgName");
    setEditVisible(false);
  };

  const handleEditCancel = () => {
    setEditVisible(false);
  };

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    await handleProfileSubmit(e, "profileImgName");
  };

  return (
    <>
      <UploadForm>
        <Label>
          <HiddenInput
            type="file"
            onChange={handleFileInputChange}
            id="profileImgName"
          />
          <CustomButton2 htmlFor="profileImgName">⚙️</CustomButton2>
        </Label>
      </UploadForm>
      <ProfileEditForm
        profileInfo={profileInfo}
        onChange={(e) =>
          setProfileInfo((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
          }))
        }
        onSubmit={handleEditSubmit}
        onCancel={handleEditCancel}
        visible={isEditVisible}
      />
    </>
  );
};

// 스타일드 컴포넌트 정의
const UploadForm = styled.form`
  opacity: 1;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
`;

const HiddenInput = styled.input`
  display: none;
`;

const CustomButton = styled.label`
  cursor: pointer;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 98%;
  height: 90%;
  opacity: 0;
  padding: 10px;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
  font-size: 18px;
`;

const CustomButton2 = styled.label`
  cursor: pointer;
  position: absolute;
  top: 13.5%;
  left: 0.8%;
  opacity: 0;
  padding: 60px;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
  font-size: 18px; /* 아이콘 크기 조정 */
`;

interface ProfileEditFormProps {
  profileInfo: {
    nickname: string;
    intro: string;
  };
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit?: () => void; // 추가: 저장 버튼 클릭 시 호출할 함수
  onCancel?: () => void; // 추가: 취소 버튼 클릭 시 호출할 함수
  visible: boolean; // 추가: 폼의 가시성 상태
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  profileInfo,
  onChange,
  onSubmit,
  onCancel,
  visible,
}) => {
  const [tempProfileInfo, setTempProfileInfo] = useState(profileInfo);
  const [nameError, setNameError] = useState(false);
  const [introduceError, setIntroduceError] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const introduceRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTempProfileInfo(profileInfo); // 폼이 열릴 때 임시 상태 초기화
    setNameError(false);
    setIntroduceError(false); // 폼이 열릴 때 에러 상태 초기화
    setIsChanged(false); // 폼이 열릴 때 변경 상태 초기화
  }, [profileInfo, visible]);

  if (!visible) return null;

  const handleFormSubmit = () => {
    // 최소 입력 길이
    if (tempProfileInfo.nickname.length === 0) {
      setNameError(true);
      return;
    }
    if (tempProfileInfo.intro.length === 0) {
      setIntroduceError(true);
      return;
    }

    if (nameError || introduceError) return; // 에러가 있으면 제출을 막음

    // 변경된 값이 없으면 제출을 막음
    if (!isChanged) {
      alert("변경된 내용이 없습니다.");
      return;
    }

    Object.keys(tempProfileInfo).forEach((key) => {
      onChange({
        target: {
          name: key,
          value: tempProfileInfo[key as keyof typeof tempProfileInfo], // tempProfileInfo의 key에 해당하는 값의 타입을 명시적으로 지정
        },
      } as ChangeEvent<HTMLInputElement | HTMLTextAreaElement>);
    });

    if (onSubmit) {
      onSubmit();
      alert("프로필이 성공적으로 저장되었습니다!");
      onCancel?.(); // 저장 후 폼 밖으로 나가게 함
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTempProfileInfo((prevInfo) => ({ ...prevInfo, [name]: value }));

    // 입력 필드 변경 시 에러 상태 초기화 및 길이 체크
    if (name === "nickname") {
      if (value.trim().length === 0 || value.length > 10) {
        setNameError(true);
      } else {
        setNameError(false);
      }
    } else if (name === "intro") {
      if (value.trim().length === 0 || value.length > 70) {
        setIntroduceError(true);
      } else {
        setIntroduceError(false);
      }
    }

    // 변경된 값이 있는지 확인
    setIsChanged(value !== profileInfo[name as keyof typeof profileInfo]);
  };

  const handleCancel = () => {
    if (window.confirm("정말로 취소하시겠습니까?")) {
      setTempProfileInfo(profileInfo); // 취소 시 임시 상태 초기화
      setNameError(false); // 에러 상태 초기화
      setIntroduceError(false); // 에러 상태 초기화
      setIsChanged(false); // 변경 상태 초기화
      onCancel?.();
    }
  };

  return (
    <OutContainer visible={visible}>
      <ProfileEditContainer visible={visible}>
        <Title>프로필 수정</Title>
        <InputLabel1>
          닉네임
          <InputField1
            type="text"
            name="nickname" // name 속성 값 수정
            value={tempProfileInfo.nickname}
            onChange={handleChange}
            ref={nameRef}
            style={{ borderColor: nameError ? "red" : "#ccc" }}
          />
        </InputLabel1>
        {nameError && (
          <NameErrorMessage>
            최소 1글자 이상, 최대 10글자까지 입력할 수 있습니다.
          </NameErrorMessage>
        )}
        <InputLabel2>
          자기소개
          <InputField2
            name="intro" // name 속성 값 수정
            value={tempProfileInfo.intro}
            onChange={handleChange}
            ref={introduceRef}
            style={{ borderColor: introduceError ? "red" : "#ccc" }}
          />
        </InputLabel2>
        {introduceError && (
          <IntroduceErrorMessage>
            최소 1글자 이상, 최대 70글자까지 입력할 수 있습니다.
          </IntroduceErrorMessage>
        )}
        <ButtonContainer>
          <CancelButton onClick={handleCancel}>취소</CancelButton>
          <SaveButton onClick={handleFormSubmit} disabled={!isChanged}>
            저장
          </SaveButton>
        </ButtonContainer>
      </ProfileEditContainer>
    </OutContainer>
  );
};

const OutContainer = styled.div<{ visible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
  animation: ${({ visible }) =>
    visible
      ? ""
      : css`
          ${fadeOutAnimation} 0.5s forwards
        `};
`;

const fadeOutAnimation = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const ProfileEditContainer = styled.div<{ visible: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  height: 300px;
  padding: 30px 45px 10px 45px;
  border-radius: 15px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background: white;
  z-index: 2;
  animation: ${({ visible }) =>
    visible
      ? ""
      : css`
          ${fadeOutAnimation} 0.5s forwards
        `};
`;

const Title = styled.div`
  text-align: center;
  font-size: 24px;
  margin-bottom: 25px;
  color: black;
`;

const InputLabel1 = styled.label`
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
  font-family: "esamanru Medium";
  color: black;
`;

const InputLabel2 = styled.label`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
  font-family: "esamanru Medium";
  color: black;
`;

const InputField1 = styled.input`
  padding: 8px;
  font-size: 14px;
  font-family: "esamanru Light";
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 4px;
`;

const InputField2 = styled.textarea`
  height: 50px;
  padding: 8px;
  font-size: 14px;
  font-family: "esamanru Light";
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 4px;
  resize: none; /* 사용자 크기 조절 비활성화 */
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const SaveButton = styled.button`
  background-color: #16be78;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 10px 20px;
  font-size: 16px;
  font-family: "esamanru Medium";
  cursor: pointer;

  &:hover {
    background-color: #13a86a;
  }
`;

const CancelButton = styled.button`
  background-color: #ccc;
  color: black;
  border: none;
  border-radius: 25px;
  padding: 10px 20px;
  font-size: 16px;
  font-family: "esamanru Medium";
  margin-right: 10px;
  cursor: pointer;

  &:hover {
    background-color: #bbb;
  }
`;

const NameErrorMessage = styled.p`
  position: absolute;
  right: 47px;
  top: 74px;
  color: red;
  font-size: 12px;
  font-family: "esamanru Medium";
`;

const IntroduceErrorMessage = styled.p`
  position: absolute;
  right: 47px;
  top: 161px;
  color: red;
  font-size: 12px;
  font-family: "esamanru Medium";
`;

export { BannerData, ProfileData, ProfileEditForm };
