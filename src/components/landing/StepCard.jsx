import {
    Card,
    CardContent,
    Avatar,
    Typography,
    Box,
} from "@mui/material"

function StepCard({
    step,
    title,
    description
}) {
    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 4,
                p: 2,
                // height: "100%",
                border: "1px solid #E2E8F0",
                transition: "0.3s",

                "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 15px 35px rgba(0,0,0,0.08)",
                },
            }}
        >
            <CardContent>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                        textAlign: "center",
                    }}
                >
                    <Avatar
                        sx={{
                            bgcolor: "primary.main",
                            width: 60,
                            height: 60,
                            fontSize: "1.3rem",
                            fontWeight: "bold",
                        }}
                    >
                        {step}
                    </Avatar>

                    <Typography variant="h6" fontWeight="bold">
                        {title}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {description}
                    </Typography>

                </Box>

            </CardContent>
        </Card>
    );
}

export default StepCard;
