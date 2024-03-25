import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';


const Input = styled(MuiInput)`
  width: 50px;
`;

export default function InputSlider(props) {

  const handleSliderChange = (event, newValue) => {
    props.setValue(newValue);
  };

  const handleInputChange = (event) => {
    props.setValue(event.target.value === '' ? '' : Number(event.target.value));
  };

  const handleBlur = () => {
    if (props.value < 0.1) {
      props.setValue(0.1);
    } else if (props.value > props.max) {
      props.setValue(props.max);
    }
  };

  return (
    <Box sx={{ width: 250 }}>
      <Grid container spacing={3} alignItems="center">
        <Grid item xs>
          <Slider
            value={typeof props.value === 'number' ? props.value : 0}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
            min={0.1}
            max={props.max}
          />
        </Grid>
        <Grid item>
          <Input
            value={props.value}
            size="small"
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputProps={{
              step: 0.1,
              min: 0.1,
              max: props.max,
              type: 'number',
              'aria-labelledby': 'input-slider',
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
