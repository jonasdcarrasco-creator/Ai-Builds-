import { Linking } from 'react-native';
import { TransportMode } from '../types';

// Deep links
export const BOOKING_URLS = {
  openTable: (venue: string) =>
    `https://www.opentable.com/s/?term=${encodeURIComponent(venue)}&metroId=4&regionIds=50&pageType=0`,
  eventbrite: (event: string) =>
    `https://www.eventbrite.com/d/pa--philadelphia/${encodeURIComponent(event)}/`,
  uber: 'uber://',
  lyft: 'lyft://ridetype?id=lyft',
  taxi: 'https://www.curb.com',
};

export async function openVenueBooking(venueName: string): Promise<void> {
  const url = BOOKING_URLS.openTable(venueName);
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      await Linking.openURL(url);
    }
  } catch {
    await Linking.openURL(BOOKING_URLS.openTable(venueName));
  }
}

export async function openEventbriteSearch(eventType: string): Promise<void> {
  const url = BOOKING_URLS.eventbrite(eventType);
  await Linking.openURL(url);
}

export async function openTransportApp(
  mode: TransportMode,
  destinationAddress?: string
): Promise<void> {
  switch (mode) {
    case 'uber': {
      const canOpen = await Linking.canOpenURL(BOOKING_URLS.uber);
      if (canOpen) {
        await Linking.openURL(BOOKING_URLS.uber);
      } else {
        await Linking.openURL('https://m.uber.com');
      }
      break;
    }
    case 'lyft': {
      const canOpen = await Linking.canOpenURL(BOOKING_URLS.lyft);
      if (canOpen) {
        await Linking.openURL(BOOKING_URLS.lyft);
      } else {
        await Linking.openURL('https://www.lyft.com');
      }
      break;
    }
    case 'walk':
    case 'transit': {
      const dest = destinationAddress
        ? encodeURIComponent(destinationAddress)
        : 'Philadelphia,PA';
      const travelMode = mode === 'transit' ? 'transit' : 'walking';
      await Linking.openURL(
        `https://maps.google.com/?travelmode=${travelMode}&destination=${dest}`
      );
      break;
    }
    case 'taxi': {
      const canOpen = await Linking.canOpenURL(BOOKING_URLS.taxi);
      if (canOpen) {
        await Linking.openURL(BOOKING_URLS.taxi);
      } else {
        await Linking.openURL('https://www.curb.com');
      }
      break;
    }
  }
}

export async function shareInvitationText(
  dateTitle: string,
  venues: string[],
  dressCode: string
): Promise<void> {
  const text =
    `💌 You're Invited!\n\n` +
    `Date Night: ${dateTitle}\n` +
    `Venues: ${venues.join(', ')}\n` +
    `Dress Code: ${dressCode}\n` +
    `📍 Surprise Location — Revealed on the night\n\n` +
    `Planned with Datefully ✨`;

  await Linking.openURL(`sms:?body=${encodeURIComponent(text)}`);
}
