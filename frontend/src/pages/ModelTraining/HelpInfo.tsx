import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const HelpInfo: React.FC = () => {
    return (
        <>
            <Title level={4}>사용 방법</Title>
            <Paragraph>
                왼쪽의 설정을 사용하여 모델 학습을 구성하세요. 
                평가할 메트릭을 선택하세요. 
                "파인튜닝 시작" 버튼을 클릭하여 프로세스를 시작하세요.
            </Paragraph>
            <Title level={4}>설정 설명</Title>
            <Paragraph>
                - Project Settings: 프로젝트와 관련된 기본 설정을 입력합니다.<br />
                - Fine-tuning Settings: 파인튜닝에 필요한 설정을 구성합니다.<br />
                - Metrics Settings: 평가할 메트릭을 선택합니다.<br />
            </Paragraph>
        </>
    );
};

export default HelpInfo;