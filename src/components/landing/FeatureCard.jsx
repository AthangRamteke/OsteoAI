import {
    Card,
    CardContent,
    Typography,
    Box
} from "@mui/material";

function FeatureCard({
    icon,
    title,
    description
}) {

    return (

        <Card
            elevation={0}
            sx={{
                borderRadius:4,
                height:"100%",
                p:2,
                transition:"0.3s",
                border:"1px solid #E2E8F0",

                "&:hover":{

                    transform:"translateY(-6px)",

                    boxShadow:"0 15px 40px rgba(0,0,0,0.08)"
                }

            }}
        >

            <CardContent>

                <Box
                    sx={{
                        fontSize:"2rem",
                        mb:2
                    }}
                >
                    {icon}
                </Box>

                <Typography
                    variant="h5"
                    fontWeight={700}
                    gutterBottom
                >

                    {title}

                </Typography>

                <Typography
                    color="text.secondary"
                >

                    {description}

                </Typography>

            </CardContent>

        </Card>

    )

}

export default FeatureCard;