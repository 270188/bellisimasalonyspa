import './styles/main.css';
import { installImageFallback } from './lib/images';
import { initServices } from './components/services';
import { initBooking } from './components/booking';
import {
  initContactInfo,
  initGallery,
  initHeader,
  initHours,
  initPrivacy,
  initReveal,
  initTeam,
  initTestimonials,
} from './components/sections';

installImageFallback();
initContactInfo();
initHeader();
initServices();
initTeam();
initGallery();
initTestimonials();
initBooking();
initHours();
initPrivacy();
initReveal();
