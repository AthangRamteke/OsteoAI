import { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Container,
    Typography,
} from "@mui/material";

import AssessmentStepper from "../../components/assessment/AssessmentStepper";
import NavigationButtons from "../../components/assessment/NavigationButtons";

import PersonalInfoForm from "../../components/assessment/PersonalInfoForm";
import LifestyleForm from "../../components/assessment/LifestyleForm";
import MedicalHistoryForm from "../../components/assessment/MedicalHistoryForm";

function Assessment() {
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        <PersonalInfoForm />,
        <LifestyleForm />,
        <MedicalHistoryForm />,
    ];

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "#F8FAFC",
                py: 8,
            }}
        >
            <Container maxWidth="md">
                <Card
                    elevation={0}
                    sx={{
                        borderRadius: 5,
                        p: 3,
                        border: "1px solid #E2E8F0",
                    }}
                >

                    <CardContent>

                        <Typography
                            variant="h4"
                            fontWeight={700}
                            align="center"
                            gutterBottom
                        >
                            Osteoporosis Risk Assessment
                        </Typography>

                        <Typography
                            variant="body1"
                            color="text.secondary"
                            align="center"
                            sx={{ mb: 5 }}
                        >
                            Complete this assessment in about 2 minutes.
                        </Typography>

                        <AssessmentStepper activeStep={activeStep} />

                        {steps[activeStep]}

                        <NavigationButtons />

                    </CardContent>

                </Card>
            </Container>
        </Box>
    );
}

export default Assessment;