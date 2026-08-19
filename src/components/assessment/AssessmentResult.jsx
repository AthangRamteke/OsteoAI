import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Typography,
} from "@mui/material";

import { useAssessment } from "../../context/AssessmentContext";

function AssessmentResult({ onEdit, onRetake }) {
    const { assessmentData } = useAssessment();

    const { personal, lifestyle, medicalHistory } = assessmentData;

    return (
        <Box
            sx={{
                
                display: "flex",
                flexDirection: "column",
                gap: 3,
            }}
        >
            <Box
                sx={{
                    textAlign: "center",
                }}
            >
                <Typography
                    variant="h4"
                    fontWeight={700}
                    gutterBottom
                >
                    Assessment Complete
                </Typography>

                <Typography
                    variant="body1"
                    color="text.secondary"
                >
                    Thank you for completing your OsteoAI assessment.
                </Typography>
            </Box>

            <Card
                elevation={0}
                sx={{
                    borderRadius: 4,
                    border: "1px solid #E2E8F0",
                    bgcolor: "#F8FAFC",
                }}
            >
                <CardContent>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        gutterBottom
                    >
                        Personal Information
                    </Typography>

                    <Typography>
                        Name: {personal.name || "Not provided"}
                    </Typography>

                    <Typography>
                        Age: {personal.age || "Not provided"}
                    </Typography>

                    <Typography>
                        Gender: {personal.gender || "Not provided"}
                    </Typography>

                    <Typography>
                        Height:{" "}
                        {personal.height
                            ? `${personal.height} cm`
                            : "Not provided"}
                    </Typography>

                    <Typography>
                        Weight:{" "}
                        {personal.weight
                            ? `${personal.weight} kg`
                            : "Not provided"}
                    </Typography>
                </CardContent>
            </Card>

            <Card
                elevation={0}
                sx={{
                    borderRadius: 4,
                    border: "1px solid #E2E8F0",
                }}
            >
                <CardContent>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        gutterBottom
                    >
                        Lifestyle Information
                    </Typography>

                    <Typography>
                        Physical Activity:{" "}
                        {lifestyle.physicalActivity || "Not provided"}
                    </Typography>

                    <Typography>
                        Smoking:{" "}
                        {lifestyle.smoking || "Not provided"}
                    </Typography>

                    <Typography>
                        Alcohol:{" "}
                        {lifestyle.alcohol || "Not provided"}
                    </Typography>
                </CardContent>
            </Card>

            <Card
                elevation={0}
                sx={{
                    borderRadius: 4,
                    border: "1px solid #E2E8F0",
                }}
            >
                <CardContent>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        gutterBottom
                    >
                        Medical History
                    </Typography>

                    <Typography>
                        Family History:{" "}
                        {medicalHistory.familyHistory || "Not provided"}
                    </Typography>

                    <Typography>
                        Previous Fracture:{" "}
                        {medicalHistory.previousFracture || "Not provided"}
                    </Typography>

                    <Typography>
                        Medications:{" "}
                        {medicalHistory.medications || "Not provided"}
                    </Typography>
                </CardContent>
            </Card>

            <Divider />

            <Card
                elevation={0}
                sx={{
                    borderRadius: 4,
                    border: "1px solid #E2E8F0",
                    textAlign: "center",
                }}
            >
                <CardContent>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        gutterBottom
                    >
                        Your Personalized Assessment
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            maxWidth: 600,
                            mx: "auto",
                        }}
                    >
                        Complete Lifestyle + Medical History information
                        has been collected. Your personalized osteoporosis
                        risk assessment will be generated here after the
                        assessment model is integrated.
                    </Typography>
                </CardContent>
            </Card>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    flexWrap: "wrap",
                }}
            >
                <Button
                    variant="outlined"
                    onClick={onEdit}
                >
                    Edit Assessment
                </Button>

                <Button
                    variant="contained"
                    onClick={onRetake}
                >
                    Retake Assessment
                </Button>
            </Box>
        </Box>
    );
}

export default AssessmentResult;